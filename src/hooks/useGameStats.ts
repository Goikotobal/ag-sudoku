'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from './useProfile';
import { recordGame, calculateXP, migrateLocalStatsToCloud, flushPendingSync, isMigrated } from '@/utils/statsSyncManager';
import type { GameResult } from '@/utils/statsManager';

export interface GameEndResult {
  xpEarned: number;
  cloudSaved: boolean;
  newLevel?: number;
  leveledUp?: boolean;
}

export function useGameStats() {
  const { user } = useAuth();
  const { profile, levelInfo, loading: profileLoading } = useProfile(user);
  const hasMigrated = useRef(false);

  // Migrate stats on first login
  useEffect(() => {
    if (!user || profileLoading || hasMigrated.current) return;

    const doMigration = async () => {
      if (!isMigrated()) {
        console.log('🔄 Starting stats migration...');
        const success = await migrateLocalStatsToCloud(user.id);
        if (success) {
          hasMigrated.current = true;
        }
      } else {
        hasMigrated.current = true;
      }

      // Flush any pending sync items
      await flushPendingSync(user.id);
    };

    doMigration();
  }, [user, profileLoading]);

  // Record game result
  const recordGameResult = useCallback(async (
    difficulty: 'medium' | 'expert' | 'pro',
    timeSeconds: number,
    mistakes: number,
    hintsUsed: number,
    isWin: boolean
  ): Promise<GameEndResult> => {
    const isPerfect = isWin && mistakes === 0;

    const result: GameResult = {
      difficulty,
      timeSeconds,
      mistakes,
      hintsUsed,
      isWin,
      isPerfect,
    };

    const xpEarned = calculateXP(result);
    const previousLevel = profile?.level || 1;

    // Record to local and cloud
    const { cloudSaved } = await recordGame(result, user?.id);

    // Check if leveled up
    const newXP = (profile?.xp || 0) + xpEarned;
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

    const leveledUp = newLevel > previousLevel;

    return {
      xpEarned,
      cloudSaved,
      newLevel,
      leveledUp,
    };
  }, [user, profile]);

  // Get XP preview for a potential result
  const getXPPreview = useCallback((
    difficulty: 'medium' | 'expert' | 'pro',
    timeSeconds: number,
    mistakes: number,
    hintsUsed: number,
    isWin: boolean
  ): number => {
    return calculateXP({
      difficulty,
      timeSeconds,
      mistakes,
      hintsUsed,
      isWin,
      isPerfect: isWin && mistakes === 0,
    });
  }, []);

  return {
    user,
    profile,
    levelInfo,
    isLoggedIn: !!user,
    recordGameResult,
    getXPPreview,
  };
}
