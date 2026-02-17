'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export interface SudokuProfile {
  user_id: string;
  nickname: string;
  avatar_id: string;
  avatar_color: string;
  frame_id: string;
  level: number;
  xp: number;
  total_games_played: number;
  total_games_won: number;
  total_playtime_seconds: number;
  pro_unlocked: boolean;
  created_at?: string;
  updated_at?: string;
}

interface LevelInfo {
  level: number;
  title: string;
  currentXP: number;
  nextLevelXP: number;
  progress: number; // 0-100
}

const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Beginner' },
  { level: 3, xp: 150, title: 'Novice' },
  { level: 5, xp: 400, title: 'Learner' },
  { level: 10, xp: 1000, title: 'Player' },
  { level: 15, xp: 2000, title: 'Solver' },
  { level: 20, xp: 3500, title: 'Expert' },
  { level: 25, xp: 5500, title: 'Master' },
  { level: 30, xp: 8000, title: 'Champion' },
  { level: 40, xp: 12000, title: 'Grandmaster' },
  { level: 50, xp: 18000, title: 'Legend' },
  { level: 75, xp: 30000, title: 'Mythic' },
  { level: 100, xp: 50000, title: 'Immortal' },
];

export function getLevelFromXP(xp: number): LevelInfo {
  let current = LEVEL_THRESHOLDS[0];
  let next = LEVEL_THRESHOLDS[1] || LEVEL_THRESHOLDS[0];

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      current = LEVEL_THRESHOLDS[i];
      next = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i];
      break;
    }
  }

  const xpInCurrentLevel = xp - current.xp;
  const xpNeededForNext = next.xp - current.xp;
  const progress = xpNeededForNext > 0
    ? Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100))
    : 100;

  return {
    level: current.level,
    title: current.title,
    currentXP: xp,
    nextLevelXP: next.xp,
    progress,
  };
}

export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<SudokuProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch or create profile when user changes
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchOrCreateProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        // Try to fetch existing profile
        const { data: existingProfile, error: fetchError } = await supabase
          .from('sudoku_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 = no rows found (expected for new users)
          throw fetchError;
        }

        if (existingProfile) {
          setProfile(existingProfile);
        } else {
          // Create new profile with data from localStorage
          const localAvatar = typeof window !== 'undefined'
            ? localStorage.getItem('ag_sudoku_avatar') || 'blinky'
            : 'blinky';

          // Get display name from Google account
          const displayName = user.user_metadata?.full_name
            || user.user_metadata?.name
            || user.email?.split('@')[0]
            || 'Player';
          const nickname = displayName.slice(0, 15);

          const newProfile: Omit<SudokuProfile, 'created_at' | 'updated_at'> = {
            user_id: user.id,
            nickname,
            avatar_id: localAvatar,
            avatar_color: '#a855f7', // Default purple
            frame_id: 'basic',
            level: 1,
            xp: 0,
            total_games_played: 0,
            total_games_won: 0,
            total_playtime_seconds: 0,
            pro_unlocked: false,
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('sudoku_profiles')
            .insert(newProfile)
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          setProfile(createdProfile);
          console.log('✅ Created new Supabase profile for:', nickname);
        }
      } catch (err: any) {
        console.error('Profile error:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateProfile();
  }, [user]);

  // Update profile in Supabase
  const updateProfile = useCallback(async (updates: Partial<SudokuProfile>) => {
    if (!user || !profile) return false;

    try {
      const supabase = createClient();

      const { data, error: updateError } = await supabase
        .from('sudoku_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setProfile(data);
      return true;
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message);
      return false;
    }
  }, [user, profile]);

  // Update nickname
  const updateNickname = useCallback(async (nickname: string) => {
    const trimmed = nickname.trim().slice(0, 15);
    if (!trimmed) return false;
    return updateProfile({ nickname: trimmed });
  }, [updateProfile]);

  // Update avatar
  const updateAvatar = useCallback(async (avatarId: string, avatarColor?: string) => {
    const updates: Partial<SudokuProfile> = { avatar_id: avatarId };
    if (avatarColor) {
      updates.avatar_color = avatarColor;
    }
    return updateProfile(updates);
  }, [updateProfile]);

  // Add XP and update level
  const addXP = useCallback(async (amount: number) => {
    if (!profile) return false;

    const newXP = profile.xp + amount;
    const levelInfo = getLevelFromXP(newXP);

    return updateProfile({
      xp: newXP,
      level: levelInfo.level,
    });
  }, [profile, updateProfile]);

  // Increment game stats
  const incrementGameStats = useCallback(async (
    isWin: boolean,
    playtimeSeconds: number
  ) => {
    if (!profile) return false;

    const updates: Partial<SudokuProfile> = {
      total_games_played: profile.total_games_played + 1,
      total_playtime_seconds: profile.total_playtime_seconds + playtimeSeconds,
    };

    if (isWin) {
      updates.total_games_won = profile.total_games_won + 1;
    }

    return updateProfile(updates);
  }, [profile, updateProfile]);

  // Get level info
  const levelInfo = profile ? getLevelFromXP(profile.xp) : null;

  return {
    profile,
    loading,
    error,
    levelInfo,
    updateProfile,
    updateNickname,
    updateAvatar,
    addXP,
    incrementGameStats,
  };
}
