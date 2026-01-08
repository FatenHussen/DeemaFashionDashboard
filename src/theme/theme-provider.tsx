// This file is kept for backwards compatibility but is no longer used
// The app.tsx no longer uses ThemeProvider since we're using Tailwind CSS


import { useSettingsContext } from 'src/shared/components/settings';

import { Rtl } from './with-settings/right-to-left';

// ----------------------------------------------------------------------

export type ThemeProviderProps = {
  children: React.ReactNode;
  themeOverrides?: unknown;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const settings = useSettingsContext();

  return <Rtl direction={settings.state.direction}>{children}</Rtl>;
}
