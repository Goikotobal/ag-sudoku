/**
 * Game Rewards Utility Functions
 * Handles XP calculation and contextual messaging for game end modals
 */

export interface GameContext {
  isWin: boolean;
  difficulty: 'medium' | 'expert' | 'pro';
  mistakes: number;
  timeSeconds: number;
  isPersonalBest?: boolean;
}

/**
 * Get contextual headline message based on game result
 */
export function getContextualMessage(context: GameContext): string {
  const { isWin, difficulty, mistakes, isPersonalBest } = context;

  if (isWin) {
    // Win messages
    if (mistakes === 0) {
      return "Flawless! You're on fire 🔥";
    }
    if (mistakes === 1) {
      return "Nearly perfect! So close 💪";
    }
    if (isPersonalBest) {
      return "New personal best! 🏆";
    }
    return "Brilliant! Well done ⭐";
  } else {
    // Loss messages
    if (mistakes === 1) {
      return "One mistake... So close! 😓";
    }
    if (difficulty === 'expert') {
      return "Expert is brutal — you'll get it 💡";
    }
    if (difficulty === 'pro') {
      return "Pro mode doesn't forgive. Yet. 😤";
    }
    return "Almost there! Keep going 💪";
  }
}

/**
 * Calculate XP earned based on game performance
 */
export function getXpEarned(context: GameContext): number {
  const { isWin, difficulty, mistakes, timeSeconds } = context;

  if (!isWin) {
    // Any loss: 15 XP participation
    return 15;
  }

  // Win XP calculation
  let xp = 0;
  let mistakePenalty = 0;
  let speedBonus = 0;

  switch (difficulty) {
    case 'medium':
      xp = 30;
      mistakePenalty = mistakes * 5;
      speedBonus = timeSeconds < 600 ? 10 : 0; // Under 10 min
      break;

    case 'expert':
      xp = 60;
      mistakePenalty = mistakes * 10;
      speedBonus = timeSeconds < 900 ? 15 : 0; // Under 15 min
      break;

    case 'pro':
      xp = 100; // Flat rate for Pro
      mistakePenalty = 0;
      speedBonus = 0;
      break;
  }

  return Math.max(xp - mistakePenalty + speedBonus, 5); // Minimum 5 XP
}

/**
 * Mock daily rank delta (placeholder until leaderboard integration)
 */
export function getDailyRankDelta(): { delta: number; direction: 'up' | 'down' | 'same' } {
  // Mock: +2 positions
  return { delta: 2, direction: 'up' };
}
