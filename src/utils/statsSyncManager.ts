/**
 * Stats Sync Manager - Handles cloud sync for AG Sudoku stats
 * - Migrates localStorage stats to Supabase on first login
 * - Saves game results to both local and cloud
 * - Manages offline queue for pending syncs
 */

import { createClient } from '@/lib/supabase/client';
import { getStats, recordGameResult as recordLocalGameResult, PlayerStats, GameResult } from './statsManager';

const MIGRATION_KEY = 'ag_sudoku_migrated';
const PENDING_SYNC_KEY = 'ag_sudoku_pending_sync';

export interface CloudGameResult extends GameResult {
  userId: string;
  xpEarned: number;
  timestamp: string;
}

interface PendingSyncItem {
  type: 'game_result';
  data: CloudGameResult;
  retries: number;
}

/**
 * Calculate XP earned from a game result
 */
export function calculateXP(result: GameResult): number {
  if (!result.isWin) return 10; // Participation XP

  let xp = 0;

  // Base XP by difficulty
  if (result.difficulty === 'medium') xp = 25;
  else if (result.difficulty === 'expert') xp = 60;
  else if (result.difficulty === 'pro') xp = 125;

  // Bonuses
  if (result.mistakes === 0) xp += 25; // Perfect game bonus
  if (result.hintsUsed === 0) xp += 10; // No hints bonus

  // Speed bonuses
  if (result.difficulty === 'medium' && result.timeSeconds < 300) xp += 20; // Under 5 min
  if (result.difficulty === 'expert' && result.timeSeconds < 600) xp += 30; // Under 10 min
  if (result.difficulty === 'pro' && result.timeSeconds < 900) xp += 50; // Under 15 min

  return xp;
}

/**
 * Check if stats have already been migrated to cloud
 */
export function isMigrated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(MIGRATION_KEY) === 'true';
}

/**
 * Get pending sync items from localStorage
 */
function getPendingSyncItems(): PendingSyncItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const pending = localStorage.getItem(PENDING_SYNC_KEY);
    return pending ? JSON.parse(pending) : [];
  } catch {
    return [];
  }
}

/**
 * Save pending sync items to localStorage
 */
function savePendingSyncItems(items: PendingSyncItem[]): void {
  if (typeof window === 'undefined') return;

  try {
    if (items.length === 0) {
      localStorage.removeItem(PENDING_SYNC_KEY);
    } else {
      localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(items));
    }
  } catch (error) {
    console.error('Failed to save pending sync items:', error);
  }
}

/**
 * Add item to pending sync queue
 */
function addToPendingSync(item: PendingSyncItem): void {
  const items = getPendingSyncItems();
  items.push(item);
  savePendingSyncItems(items);
  console.log('📥 Added to pending sync queue:', item.type);
}

/**
 * Migrate localStorage stats to Supabase
 */
export async function migrateLocalStatsToCloud(userId: string): Promise<boolean> {
  if (isMigrated()) {
    console.log('⏭️ Stats already migrated, skipping');
    return true;
  }

  const localStats = getStats();
  const supabase = createClient();

  try {
    // Calculate totals from local stats
    let totalGamesPlayed = 0;
    let totalGamesWon = 0;
    let totalPlaytime = localStats.totalPlaytime || 0;

    // Migrate per-difficulty stats
    const difficulties = ['medium', 'expert', 'pro'] as const;

    for (const difficulty of difficulties) {
      const diffStats = localStats.perDifficulty[difficulty];

      if (diffStats.gamesPlayed === 0) continue;

      totalGamesPlayed += diffStats.gamesPlayed;
      totalGamesWon += diffStats.gamesWon;

      // Upsert difficulty stats
      const { error: statsError } = await supabase
        .from('sudoku_game_stats')
        .upsert({
          user_id: userId,
          difficulty,
          games_played: diffStats.gamesPlayed,
          games_won: diffStats.gamesWon,
          best_time_seconds: diffStats.bestTimeSeconds,
          avg_time_seconds: diffStats.avgTimeSeconds,
          total_time_seconds: diffStats.totalTimeSeconds,
          hints_used: diffStats.hintsUsed,
          mistakes_total: diffStats.mistakesTotal,
          perfect_games: diffStats.perfectGames,
          current_streak: difficulty === 'medium' ? localStats.currentStreak : 0,
          longest_streak: difficulty === 'medium' ? localStats.longestStreak : 0,
          last_played_date: localStats.lastPlayDate,
        }, {
          onConflict: 'user_id,difficulty',
        });

      if (statsError) {
        console.error(`Failed to migrate ${difficulty} stats:`, statsError);
        throw statsError;
      }

      console.log(`✅ Migrated ${difficulty} stats`);
    }

    // Update profile totals
    const { error: profileError } = await supabase
      .from('sudoku_profiles')
      .update({
        total_games_played: totalGamesPlayed,
        total_games_won: totalGamesWon,
        total_playtime_seconds: totalPlaytime,
      })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Failed to update profile totals:', profileError);
      throw profileError;
    }

    // Mark migration as complete
    localStorage.setItem(MIGRATION_KEY, 'true');
    console.log('✅ Migration complete! Total games:', totalGamesPlayed);

    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

/**
 * Save game result to Supabase
 */
async function saveGameResultToCloud(
  userId: string,
  result: GameResult,
  xpEarned: number
): Promise<boolean> {
  const supabase = createClient();

  try {
    // 1. Insert into game history
    const { error: historyError } = await supabase
      .from('sudoku_game_history')
      .insert({
        user_id: userId,
        difficulty: result.difficulty,
        time_seconds: result.timeSeconds,
        mistakes: result.mistakes,
        hints_used: result.hintsUsed,
        is_win: result.isWin,
        is_perfect: result.isPerfect,
        xp_earned: xpEarned,
      });

    if (historyError) {
      throw historyError;
    }

    // 2. Update difficulty stats
    // First, fetch current stats
    const { data: currentStats } = await supabase
      .from('sudoku_game_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('difficulty', result.difficulty)
      .single();

    const now = new Date().toISOString().split('T')[0];

    if (currentStats) {
      // Update existing stats
      const newGamesPlayed = currentStats.games_played + 1;
      const newGamesWon = currentStats.games_won + (result.isWin ? 1 : 0);
      const newTotalTime = currentStats.total_time_seconds + result.timeSeconds;

      // Calculate new best time (only for wins)
      let newBestTime = currentStats.best_time_seconds;
      if (result.isWin && (!newBestTime || result.timeSeconds < newBestTime)) {
        newBestTime = result.timeSeconds;
      }

      // Calculate new average time (only for wins)
      let newAvgTime = currentStats.avg_time_seconds;
      if (result.isWin) {
        if (!newAvgTime) {
          newAvgTime = result.timeSeconds;
        } else {
          newAvgTime = Math.round(
            ((newAvgTime * (newGamesWon - 1)) + result.timeSeconds) / newGamesWon
          );
        }
      }

      const { error: updateError } = await supabase
        .from('sudoku_game_stats')
        .update({
          games_played: newGamesPlayed,
          games_won: newGamesWon,
          best_time_seconds: newBestTime,
          avg_time_seconds: newAvgTime,
          total_time_seconds: newTotalTime,
          hints_used: currentStats.hints_used + result.hintsUsed,
          mistakes_total: currentStats.mistakes_total + result.mistakes,
          perfect_games: currentStats.perfect_games + (result.isPerfect ? 1 : 0),
          last_played_date: now,
        })
        .eq('user_id', userId)
        .eq('difficulty', result.difficulty);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Insert new stats row
      const { error: insertError } = await supabase
        .from('sudoku_game_stats')
        .insert({
          user_id: userId,
          difficulty: result.difficulty,
          games_played: 1,
          games_won: result.isWin ? 1 : 0,
          best_time_seconds: result.isWin ? result.timeSeconds : null,
          avg_time_seconds: result.isWin ? result.timeSeconds : null,
          total_time_seconds: result.timeSeconds,
          hints_used: result.hintsUsed,
          mistakes_total: result.mistakes,
          perfect_games: result.isPerfect ? 1 : 0,
          current_streak: 0,
          longest_streak: 0,
          last_played_date: now,
        });

      if (insertError) {
        throw insertError;
      }
    }

    // 3. Update profile totals and XP
    const { data: profile } = await supabase
      .from('sudoku_profiles')
      .select('total_games_played, total_games_won, total_playtime_seconds, xp, level')
      .eq('user_id', userId)
      .single();

    if (profile) {
      const newXP = profile.xp + xpEarned;

      // Calculate new level based on XP
      const LEVEL_THRESHOLDS = [
        { level: 1, xp: 0 },
        { level: 3, xp: 150 },
        { level: 5, xp: 400 },
        { level: 10, xp: 1000 },
        { level: 15, xp: 2000 },
        { level: 20, xp: 3500 },
        { level: 25, xp: 5500 },
        { level: 30, xp: 8000 },
        { level: 40, xp: 12000 },
        { level: 50, xp: 18000 },
        { level: 75, xp: 30000 },
        { level: 100, xp: 50000 },
      ];

      let newLevel = 1;
      for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (newXP >= LEVEL_THRESHOLDS[i].xp) {
          newLevel = LEVEL_THRESHOLDS[i].level;
          break;
        }
      }

      const { error: profileError } = await supabase
        .from('sudoku_profiles')
        .update({
          total_games_played: profile.total_games_played + 1,
          total_games_won: profile.total_games_won + (result.isWin ? 1 : 0),
          total_playtime_seconds: profile.total_playtime_seconds + result.timeSeconds,
          xp: newXP,
          level: newLevel,
        })
        .eq('user_id', userId);

      if (profileError) {
        throw profileError;
      }
    }

    console.log('✅ Game result saved to cloud');
    return true;
  } catch (error) {
    console.error('Failed to save to cloud:', error);
    return false;
  }
}

/**
 * Record a game result (both local and cloud if logged in)
 */
export async function recordGame(
  result: GameResult,
  userId?: string | null
): Promise<{ localStats: PlayerStats; xpEarned: number; cloudSaved: boolean }> {
  // 1. Always save to localStorage
  const localStats = recordLocalGameResult(result);

  // 2. Calculate XP
  const xpEarned = calculateXP(result);

  // 3. If logged in, save to cloud
  let cloudSaved = false;

  if (userId) {
    cloudSaved = await saveGameResultToCloud(userId, result, xpEarned);

    if (!cloudSaved) {
      // Add to pending sync queue
      addToPendingSync({
        type: 'game_result',
        data: {
          ...result,
          userId,
          xpEarned,
          timestamp: new Date().toISOString(),
        },
        retries: 0,
      });
    }
  }

  return { localStats, xpEarned, cloudSaved };
}

/**
 * Flush pending sync queue
 */
export async function flushPendingSync(userId: string): Promise<number> {
  const items = getPendingSyncItems();
  if (items.length === 0) return 0;

  console.log(`📤 Flushing ${items.length} pending sync items...`);

  const remainingItems: PendingSyncItem[] = [];
  let synced = 0;

  for (const item of items) {
    if (item.type === 'game_result' && item.data.userId === userId) {
      const success = await saveGameResultToCloud(
        userId,
        item.data,
        item.data.xpEarned
      );

      if (success) {
        synced++;
      } else if (item.retries < 3) {
        // Keep in queue with incremented retries
        remainingItems.push({ ...item, retries: item.retries + 1 });
      } else {
        console.warn('Dropping sync item after 3 retries:', item);
      }
    } else {
      remainingItems.push(item);
    }
  }

  savePendingSyncItems(remainingItems);
  console.log(`✅ Synced ${synced} items, ${remainingItems.length} remaining`);

  return synced;
}

/**
 * Fetch cloud stats for a user
 */
export async function fetchCloudStats(userId: string): Promise<{
  perDifficulty: Record<string, any>;
  profile: any;
} | null> {
  const supabase = createClient();

  try {
    // Fetch per-difficulty stats
    const { data: difficultyStats, error: statsError } = await supabase
      .from('sudoku_game_stats')
      .select('*')
      .eq('user_id', userId);

    if (statsError) throw statsError;

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('sudoku_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) throw profileError;

    // Convert to keyed object
    const perDifficulty: Record<string, any> = {};
    for (const stat of difficultyStats || []) {
      perDifficulty[stat.difficulty] = stat;
    }

    return { perDifficulty, profile };
  } catch (error) {
    console.error('Failed to fetch cloud stats:', error);
    return null;
  }
}
