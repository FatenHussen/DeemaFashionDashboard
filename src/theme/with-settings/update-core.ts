import type { ThemeColorScheme } from '../types';
import type { SettingsState } from 'src/shared/components/settings';

import { setFont, hexToRgbChannel, createPaletteChannel } from 'minimal-shared/utils';

import { palette } from '../core/palette';
import { primaryColorPresets } from './color-presets';
import { createShadowColor } from '../core/custom-shadows';

// ----------------------------------------------------------------------

/**
 * Theme options type (simplified without MUI)
 */
export type ThemeOptions = {
  direction?: 'ltr' | 'rtl';
  colorSchemes?: {
    light?: {
      palette?: Partial<typeof palette.light>;
      shadows?: string[];
      customShadows?: Record<string, string>;
    };
    dark?: {
      palette?: Partial<typeof palette.dark>;
      shadows?: string[];
      customShadows?: Record<string, string>;
    };
  };
  typography?: {
    fontFamily?: string;
  };
};

/**
 * Updates the core theme with the provided settings state.
 * @param theme - The base theme options to update.
 * @param settingsState - The settings state containing direction, fontFamily, contrast, and primaryColor.
 * @returns Updated theme options with applied settings.
 */
export function applySettingsToTheme(
  theme: ThemeOptions,
  settingsState?: SettingsState
): ThemeOptions {
  const {
    direction,
    fontFamily,
    contrast = 'default',
    primaryColor = 'default',
  } = settingsState ?? {};

  const isDefaultContrast = contrast === 'default';
  const isDefaultPrimaryColor = primaryColor === 'default';

  const lightPalette = theme.colorSchemes?.light?.palette || palette.light;

  const primaryColorPalette = createPaletteChannel(primaryColorPresets[primaryColor]);

  const updateColorScheme = (schemeName: ThemeColorScheme): NonNullable<ThemeOptions['colorSchemes']>[ThemeColorScheme] => {
    const currentScheme = theme.colorSchemes?.[schemeName];

    const updatedPalette: Partial<typeof palette.light> = {
      ...currentScheme?.palette,
      ...(!isDefaultPrimaryColor && {
        primary: primaryColorPalette,
      }),
      ...(schemeName === 'light' && lightPalette?.grey && {
        background: {
          ...lightPalette?.background,
          ...(!isDefaultContrast && {
            default: lightPalette.grey[200],
            defaultChannel: hexToRgbChannel(lightPalette.grey[200]),
          }),
        } as typeof lightPalette.background,
      }),
    };

    const updatedCustomShadows = {
      ...currentScheme?.customShadows,
      ...(!isDefaultPrimaryColor && {
        primary: createShadowColor(primaryColorPalette.mainChannel),
      }),
    };

    return {
      ...currentScheme,
      palette: updatedPalette,
      customShadows: updatedCustomShadows,
    } as NonNullable<ThemeOptions['colorSchemes']>[ThemeColorScheme];
  };

  return {
    ...theme,
    direction,
    colorSchemes: {
      light: updateColorScheme('light'),
      dark: updateColorScheme('dark'),
    },
    typography: {
      ...theme.typography,
      fontFamily: setFont(fontFamily),
    },
  };
}
