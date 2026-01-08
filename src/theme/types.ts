// ----------------------------------------------------------------------

/**
 * Theme color scheme options
 */
export type ThemeColorScheme = 'light' | 'dark';

/**
 * CSS variables configuration
 */
export type ThemeCssVariables = {
  cssVarPrefix?: string;
  rootSelector?: string;
  colorSchemeSelector?: string;
  disableCssColorScheme?: boolean;
  shouldSkipGeneratingVar?: (key: string) => boolean;
};

/**
 * Record type for color schemes
 */
export type SchemesRecord<T> = Partial<Record<ThemeColorScheme, T>>;

/**
 * DeepPartial utility type that recursively makes all properties of T optional.
 * This is useful for partial configurations and merging deeply nested objects.
 * Supports objects, arrays, and primitive types.
 */
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
