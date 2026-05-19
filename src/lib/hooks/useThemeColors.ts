/**
 * TipL — useThemeColors Hook
 * Returns the active color palette based on theme setting (light | dark).
 * Import this instead of Colors directly wherever theme-aware styling is needed.
 *
 * Usage:
 *   const C = useThemeColors();
 *   <View style={{ backgroundColor: C.offWhite }} />
 */

import { Colors, DarkColors } from '@/src/lib/constants';
import { useSettingsStore } from '@/src/store/settingsStore';

export type ThemeColorSet = typeof Colors;

export function useThemeColors(): ThemeColorSet {
  const theme = useSettingsStore((s) => s.theme);
  return theme === 'dark' ? (DarkColors as unknown as ThemeColorSet) : Colors;
}

/** Returns true when dark mode is active — handy for conditional logic. */
export function useIsDark(): boolean {
  return useSettingsStore((s) => s.theme) === 'dark';
}
