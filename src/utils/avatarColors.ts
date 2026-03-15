/**
 * Avatar Color Filter Utility
 * Maps color IDs to CSS filter strings for avatar customization
 */

export type ColorId =
  | 'original'
  | 'blue'
  | 'green'
  | 'orange'
  | 'purple'
  | 'pink'
  | 'gold'
  | 'silver'
  | 'neon-cyan'
  | 'neon-pink'
  | 'rainbow'
  | 'holographic'
  | 'lava'
  | 'ice-crystal'
  | 'midnight';

/**
 * Get CSS filter string for a given color ID
 */
export function getAvatarColorFilter(colorId?: string | null): string {
  if (!colorId) return 'none';

  const filters: Record<string, string> = {
    'original': 'none',
    'blue': 'hue-rotate(0deg)',
    'green': 'hue-rotate(90deg)',
    'orange': 'hue-rotate(30deg)',
    'purple': 'hue-rotate(270deg)',
    'pink': 'hue-rotate(320deg)',
    'gold': 'hue-rotate(45deg) saturate(1.5)',
    'silver': 'grayscale(50%) brightness(1.3)',
    'neon-cyan': 'hue-rotate(180deg) saturate(2)',
    'neon-pink': 'hue-rotate(300deg) saturate(2)',
    'midnight': 'brightness(0.3) contrast(1.5)',
    // Special animated filters would need custom CSS keyframes
    'rainbow': 'hue-rotate(0deg)', // Would need animation
    'holographic': 'none', // Would need shimmer effect
    'lava': 'hue-rotate(0deg) saturate(1.8)', // Would need pulsing
    'ice-crystal': 'hue-rotate(180deg) brightness(1.3)', // Would need frost
  };

  return filters[colorId] || 'none';
}

/**
 * Check if a color is premium-only
 */
export function isColorPremium(colorId: string): boolean {
  const premiumColors = [
    'gold',
    'silver',
    'neon-cyan',
    'neon-pink',
    'rainbow',
    'holographic',
    'lava',
    'ice-crystal',
    'midnight',
  ];
  return premiumColors.includes(colorId);
}

/**
 * Get all available colors
 */
export function getAvailableColors(isPremium: boolean = false): Array<{ id: ColorId; name: string; premium: boolean }> {
  const colors = [
    { id: 'original' as ColorId, name: 'Original', premium: false },
    { id: 'blue' as ColorId, name: 'Blue', premium: false },
    { id: 'green' as ColorId, name: 'Green', premium: false },
    { id: 'orange' as ColorId, name: 'Orange', premium: false },
    { id: 'purple' as ColorId, name: 'Purple', premium: false },
    { id: 'pink' as ColorId, name: 'Pink', premium: false },
    { id: 'gold' as ColorId, name: 'Gold', premium: true },
    { id: 'silver' as ColorId, name: 'Silver', premium: true },
    { id: 'neon-cyan' as ColorId, name: 'Neon Cyan', premium: true },
    { id: 'neon-pink' as ColorId, name: 'Neon Pink', premium: true },
    { id: 'rainbow' as ColorId, name: 'Rainbow', premium: true },
  ];

  return isPremium ? colors : colors.filter(c => !c.premium);
}
