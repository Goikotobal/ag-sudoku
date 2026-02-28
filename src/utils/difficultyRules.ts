// Difficulty rules for AG Sudoku
// maxErrors: number of mistakes allowed (0 = no mistakes allowed)
// maxHints: number of AI hints available

export interface DifficultyRules {
  maxErrors: number;
  maxHints: number;
}

// Get rules for Free tier
export function getFreeRules(difficulty: string): DifficultyRules | null {
  if (difficulty === 'medium') {
    return { maxErrors: 3, maxHints: 3 };
  }
  if (difficulty === 'expert') {
    return { maxErrors: 1, maxHints: 1 };
  }
  if (difficulty === 'pro') {
    return null; // Pro difficulty not available for free users
  }
  return { maxErrors: 3, maxHints: 3 };
}

// Get rules for Pro tier
export function getProRules(difficulty: string): DifficultyRules {
  if (difficulty === 'medium') {
    return { maxErrors: 3, maxHints: 3 };
  }
  if (difficulty === 'expert') {
    return { maxErrors: 1, maxHints: 3 };
  }
  if (difficulty === 'pro') {
    return { maxErrors: 0, maxHints: 2 };
  }
  return { maxErrors: 3, maxHints: 3 };
}

// Get rules based on user's subscription tier
export function getDifficultyRules(
  difficulty: string,
  isPro: boolean
): DifficultyRules | null {
  if (isPro) {
    return getProRules(difficulty);
  }
  return getFreeRules(difficulty);
}

// Check if user can access a difficulty level
export function canAccessDifficulty(difficulty: string, isPro: boolean): boolean {
  if (difficulty === 'pro' && !isPro) return false;
  return true;
}
