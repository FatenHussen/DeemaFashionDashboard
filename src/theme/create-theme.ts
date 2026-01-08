// This file is kept for backwards compatibility but is no longer used
// Since we're using Tailwind CSS, we don't need to create MUI themes

import type { SettingsState } from 'src/shared/components/settings';
import type { ThemeOptions } from './with-settings/update-core';

// ----------------------------------------------------------------------

export const baseTheme: ThemeOptions = {
  colorSchemes: {
    light: {},
    dark: {},
  },
};

// ----------------------------------------------------------------------

type CreateThemeProps = {
  settingsState?: SettingsState;
  themeOverrides?: ThemeOptions;
  localeComponents?: unknown;
};

export function createTheme({
  settingsState,
  themeOverrides = {},
}: CreateThemeProps = {}): ThemeOptions {
  // Return a minimal theme object for backwards compatibility
  // Actual theming is handled via CSS variables and Tailwind classes
  return {
    ...baseTheme,
    ...themeOverrides,
  };
}
