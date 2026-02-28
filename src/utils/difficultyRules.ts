// Difficulty rules for AG Sudoku
// maxErrors: number of mistakes allowed (0 = no mistakes allowed)
// maxHints: number of AI hints available

export interface DifficultyRules {
  maxErrors: number;
  maxHints: number;
}

export function getDifficultyRules(
  difficulty: string,
  isPro: boolean
): DifficultyRules | null {
  if (difficulty === 'medium') {
    return { maxErrors: 3, maxHints: 3 };
  }

  if (difficulty === 'expert') {
    return { maxErrors: 1, maxHints: isPro ? 3 : 1 };
  }

  if (difficulty === 'pro') {
    if (!isPro) return null; // blocked for non-pro users
    return { maxErrors: 0, maxHints: 2 };
  }

  // Default fallback
  return { maxErrors: 3, maxHints: 3 };
}

// Check if user can access a difficulty level
export function canAccessDifficulty(difficulty: string, isPro: boolean): boolean {
  if (difficulty === 'pro' && !isPro) return false;
  return true;
}
