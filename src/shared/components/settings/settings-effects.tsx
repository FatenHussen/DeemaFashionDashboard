import { useEffect } from 'react';

import { useSettingsContext } from './context/use-settings-context';

/**
 * Applies settings to the DOM so all Settings panel options take effect.
 * - direction (RTL/LTR)
 * - fontFamily
 * - fontSize
 * - contrast
 * - compactLayout (data attribute for layout density)
 */
export function SettingsEffects() {
  const { state } = useSettingsContext();

  // Direction is handled by useLocalizationStore (driven by language selection).
  // Do NOT set dir here — it would overwrite the language-based direction on reload.

  // Font family: apply to html element
  useEffect(() => {
    const root = document.documentElement;
    const fontFamily = state.fontFamily ? `"${state.fontFamily}", system-ui, sans-serif` : '';
    root.style.setProperty('font-family', fontFamily);
    return () => {
      root.style.removeProperty('font-family');
    };
  }, [state.fontFamily]);

  // Font size: apply as CSS variable (used by Tailwind/text)
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${state.fontSize}px`;
    return () => {
      root.style.fontSize = '';
    };
  }, [state.fontSize]);

  // Contrast: add class and override background tokens for high-contrast (light mode only)
  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    if (state.contrast === 'hight' && !isDark) {
      root.classList.add('contrast-high');
      root.style.setProperty('--background', '244 246 248');
      root.style.setProperty('--muted', '229 231 235');
    } else {
      root.classList.remove('contrast-high');
      root.style.removeProperty('--background');
      root.style.removeProperty('--muted');
    }
    return () => {
      root.classList.remove('contrast-high');
      root.style.removeProperty('--background');
      root.style.removeProperty('--muted');
    };
  }, [state.contrast, state.colorScheme]);

  // Compact layout: data attribute for responsive styling
  useEffect(() => {
    const root = document.documentElement;
    if (state.compactLayout) {
      root.setAttribute('data-compact', 'true');
    } else {
      root.removeAttribute('data-compact');
    }
    return () => {
      root.removeAttribute('data-compact');
    };
  }, [state.compactLayout]);

  return null;
}
