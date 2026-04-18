import type { ThemeOptions } from './with-settings/update-core';

import { createPaletteChannel } from 'minimal-shared/utils';

import { themeConfig } from './theme-config';

// ----------------------------------------------------------------------

const primaryChannel = createPaletteChannel(themeConfig.palette.primary);

export const themeOverrides: ThemeOptions = {
  colorSchemes: {
    light: {
      palette: {
        primary: primaryChannel,
      },
    },
    dark: {
      palette: {
        primary: primaryChannel,
      },
    },
  },
};
