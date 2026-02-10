/**
 * Settings Manager - Local storage-based settings for AG Sudoku
 */

export interface GameSettings {
  theme: 'dark' | 'light'; // dark = current aurora theme (default)
  showTimer: boolean; // default true
  showMistakeCounter: boolean; // default true
  highlightSameNumbers: boolean; // default true (highlight matching numbers on board)
  autoRemoveNotes: boolean; // default true (auto-clear notes when number placed)
  language: string; // current locale
}

const STORAGE_KEY = 'ag_sudoku_settings';

const DEFAULT_SETTINGS: GameSettings = {
  theme: 'dark',
  showTimer: true,
  showMistakeCounter: true,
  highlightSameNumbers: true,
  autoRemoveNotes: true,
  language: 'en',
};

/**
 * Load settings from localStorage
 */
export function getSettings(): GameSettings {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<GameSettings>;
      // Merge with defaults to ensure all keys exist
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
      };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }

  return { ...DEFAULT_SETTINGS };
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings: GameSettings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * Update a single setting and save
 */
export function updateSetting<K extends keyof GameSettings>(
  key: K,
  value: GameSettings[K]
): GameSettings {
  const settings = getSettings();
  settings[key] = value;
  saveSettings(settings);
  return settings;
}

/**
 * Reset all settings to defaults
 */
export function resetSettings(): GameSettings {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset settings:', error);
  }

  return { ...DEFAULT_SETTINGS };
}

/**
 * Get default settings
 */
export function getDefaultSettings(): GameSettings {
  return { ...DEFAULT_SETTINGS };
}
