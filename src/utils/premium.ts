/**
 * Premium Feature Gating Utilities
 * Helpers to check subscription status and feature access
 */

export type SubscriptionTier = 'free' | 'premium';
export type AvatarTier = 'free' | 'premium';

/**
 * Check if user has premium subscription
 */
export function isPremium(subscriptionTier: string | null | undefined): boolean {
  return subscriptionTier === 'premium';
}

/**
 * Check if user can access a specific avatar
 */
export function canAccessAvatar(
  avatarTier: AvatarTier,
  userSubscription: string | null | undefined
): boolean {
  if (avatarTier === 'free') return true;
  return isPremium(userSubscription);
}

/**
 * Get list of features available for each tier
 */
export function getTierFeatures(tier: SubscriptionTier) {
  const freeFeatures = [
    'Basic 6 monster avatars',
    'All difficulty levels',
    'AI-powered hints',
    'Cloud save (with account)',
    'XP & Level tracking',
  ];

  const premiumFeatures = [
    'All 20 monster avatars',
    'Premium colors & frames (coming soon)',
    'Advanced statistics (coming soon)',
    'Leaderboard rankings (coming soon)',
    'Ad-free experience (coming soon)',
  ];

  return tier === 'premium'
    ? [...freeFeatures, ...premiumFeatures]
    : freeFeatures;
}

/**
 * Price IDs for subscriptions
 */
export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID || '',
  yearly: process.env.STRIPE_YEARLY_PRICE_ID || '',
};

/**
 * Subscription pricing display info
 */
export const SUBSCRIPTION_PRICING = {
  monthly: {
    price: '€2.49',
    period: 'month',
    label: 'Monthly',
  },
  yearly: {
    price: '€19.99',
    period: 'year',
    label: 'Yearly',
    savings: '33%',
  },
};
