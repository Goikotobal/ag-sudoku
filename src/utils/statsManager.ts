/**
 * Stats Manager - Local storage-based statistics tracking for AG Sudoku
 * Designed to mirror future Supabase schema for easy migration
 */

export interface DifficultyStats {
  gamesPlayed: number;
  gamesWon: number;
  bestTimeSeconds: number | null;
  avgTimeSeconds: number | null;
  totalTimeSeconds: number;
  hintsUsed: number;
  mistakesTotal: number;
  perfectGames: number; // wins with 0 mistakes
}

export interface PlayerStats {
  perDifficulty: {
    medium: DifficultyStats;
    expert: DifficultyStats;
    pro: DifficultyStats;
  };
  currentStreak: number;
  longestStreak: number;
  lastPlayDate: string | null; // ISO date string
  totalPlaytime: number; // seconds
  firstGameDate: string | null;
}

export interface GameResult {
  difficulty: 'medium' | 'expert' | 'pro';
  timeSeconds: number;
  mistakes: number;
  hintsUsed: number;
  isWin: boolean;
  isPerfect: boolean; // win + 0 mistakes
}

const STORAGE_KEY = 'ag_sudoku_stats';

function createEmptyDifficultyStats(): DifficultyStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    bestTimeSeconds: null,
    avgTimeSeconds: null,
    totalTimeSeconds: 0,
    hintsUsed: 0,
    mistakesTotal: 0,
    perfectGames: 0,
  };
}

function createEmptyStats(): PlayerStats {
  return {
    perDifficulty: {
      medium: createEmptyDifficultyStats(),
      expert: createEmptyDifficultyStats(),
      pro: createEmptyDifficultyStats(),
    },
    currentStreak: 0,
    longestStreak: 0,
    lastPlayDate: null,
    totalPlaytime: 0,
    firstGameDate: null,
  };
}

/**
 * Load stats from localStorage
 */
export function getStats(): PlayerStats {
  if (typeof window === 'undefined') {
    return createEmptyStats();
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as PlayerStats;
      // Ensure all difficulty levels exist (migration safety)
      if (!parsed.perDifficulty) {
        parsed.perDifficulty = {
          medium: createEmptyDifficultyStats(),
          expert: createEmptyDifficultyStats(),
          pro: createEmptyDifficultyStats(),
        };
      }
      // Ensure each difficulty has all fields
      (['medium', 'expert', 'pro'] as const).forEach((diff) => {
        if (!parsed.perDifficulty[diff]) {
          parsed.perDifficulty[diff] = createEmptyDifficultyStats();
        }
      });
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }

  return createEmptyStats();
}

/**
 * Save stats to localStorage
 */
function saveStats(stats: PlayerStats): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save stats:', error);
  }
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if date2 is the day after date1
 */
function isNextDay(date1: Date, date2: Date): boolean {
  const nextDay = new Date(date1);
  nextDay.setDate(nextDay.getDate() + 1);
  return isSameDay(nextDay, date2);
}

/**
 * Record a game result and update stats
 */
export function recordGameResult(result: GameResult): PlayerStats {
  const stats = getStats();
  const diffStats = stats.perDifficulty[result.difficulty];
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];

  // Update games played
  diffStats.gamesPlayed += 1;

  // Update time tracking
  diffStats.totalTimeSeconds += result.timeSeconds;
  stats.totalPlaytime += result.timeSeconds;

  // Update mistakes and hints
  diffStats.mistakesTotal += result.mistakes;
  diffStats.hintsUsed += result.hintsUsed;

  // Handle win-specific stats
  if (result.isWin) {
    diffStats.gamesWon += 1;

    // Update best time (only for wins)
    if (diffStats.bestTimeSeconds === null || result.timeSeconds < diffStats.bestTimeSeconds) {
      diffStats.bestTimeSeconds = result.timeSeconds;
    }

    // Update perfect games
    if (result.isPerfect) {
      diffStats.perfectGames += 1;
    }
  }

  // Calculate average time for wins
  if (diffStats.gamesWon > 0) {
    // We need to track total win time for accurate average
    // For now, we'll use a weighted approach based on current avg
    const winGames = diffStats.gamesWon;
    if (result.isWin) {
      if (diffStats.avgTimeSeconds === null) {
        diffStats.avgTimeSeconds = result.timeSeconds;
      } else {
        // Running average: ((old_avg * (n-1)) + new_value) / n
        diffStats.avgTimeSeconds = Math.round(
          ((diffStats.avgTimeSeconds * (winGames - 1)) + result.timeSeconds) / winGames
        );
      }
    }
  }

  // Update streak (only counting wins)
  if (result.isWin) {
    if (stats.lastPlayDate) {
      const lastDate = new Date(stats.lastPlayDate);
      if (isSameDay(lastDate, today)) {
        // Same day, streak continues (but doesn't increment again)
      } else if (isNextDay(lastDate, today)) {
        // Next day, increment streak
        stats.currentStreak += 1;
      } else {
        // More than 1 day gap, reset streak
        stats.currentStreak = 1;
      }
    } else {
      // First game ever
      stats.currentStreak = 1;
    }

    // Update longest streak
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }

    // Update last play date (only for wins to maintain streak logic)
    stats.lastPlayDate = todayISO;
  } else {
    // Loss breaks the streak
    if (stats.lastPlayDate) {
      const lastDate = new Date(stats.lastPlayDate);
      if (!isSameDay(lastDate, today) && !isNextDay(lastDate, today)) {
        // More than 1 day since last win, reset streak
        stats.currentStreak = 0;
      }
    }
  }

  // Set first game date if not set
  if (!stats.firstGameDate) {
    stats.firstGameDate = todayISO;
  }

  saveStats(stats);
  return stats;
}

/**
 * Calculate win rate for a specific difficulty
 */
export function getWinRate(difficulty: 'medium' | 'expert' | 'pro'): number {
  const stats = getStats();
  const diffStats = stats.perDifficulty[difficulty];

  if (diffStats.gamesPlayed === 0) {
    return 0;
  }

  return Math.round((diffStats.gamesWon / diffStats.gamesPlayed) * 100);
}

/**
 * Calculate overall win rate across all difficulties
 */
export function getOverallWinRate(): number {
  const stats = getStats();
  let totalPlayed = 0;
  let totalWon = 0;

  (['medium', 'expert', 'pro'] as const).forEach((diff) => {
    totalPlayed += stats.perDifficulty[diff].gamesPlayed;
    totalWon += stats.perDifficulty[diff].gamesWon;
  });

  if (totalPlayed === 0) {
    return 0;
  }

  return Math.round((totalWon / totalPlayed) * 100);
}

/**
 * Get total games played across all difficulties
 */
export function getTotalGamesPlayed(): number {
  const stats = getStats();
  return (
    stats.perDifficulty.medium.gamesPlayed +
    stats.perDifficulty.expert.gamesPlayed +
    stats.perDifficulty.pro.gamesPlayed
  );
}

/**
 * Get total games won across all difficulties
 */
export function getTotalGamesWon(): number {
  const stats = getStats();
  return (
    stats.perDifficulty.medium.gamesWon +
    stats.perDifficulty.expert.gamesWon +
    stats.perDifficulty.pro.gamesWon
  );
}

/**
 * Format time in seconds to MM:SS or HH:MM:SS format
 */
export function formatTime(seconds: number | null): string {
  if (seconds === null || seconds === 0) {
    return '--:--';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format total playtime in a human-readable format
 */
export function formatPlaytime(seconds: number): string {
  if (seconds === 0) {
    return '0m';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

/**
 * Reset all stats (clear localStorage)
 */
export function resetStats(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset stats:', error);
  }
}
