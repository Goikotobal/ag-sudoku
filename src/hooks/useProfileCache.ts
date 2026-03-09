'use client';

import { useState, useEffect } from 'react';

const PROFILE_CACHE_KEY = 'goiko_profile_cache';
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface ProfileCache {
  displayName: string;
  avatarId: string;
  colorId: string;
  isPro: boolean;
  locale: string;
  cachedAt: number;
}

function readProfileCache(): ProfileCache | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!cached) return null;
    const cache: ProfileCache = JSON.parse(cached);
    // Check if cache is stale (older than 7 days)
    if (Date.now() - cache.cachedAt > CACHE_MAX_AGE_MS) {
      localStorage.removeItem(PROFILE_CACHE_KEY);
      return null;
    }
    return cache;
  } catch {
    return null;
  }
}

/**
 * Hook to read profile cache from localStorage
 * Used for offline authentication and personalization
 */
export function useProfileCache(): ProfileCache | null {
  const [cache, setCache] = useState<ProfileCache | null>(null);

  useEffect(() => {
    setCache(readProfileCache());
  }, []);

  return cache;
}
