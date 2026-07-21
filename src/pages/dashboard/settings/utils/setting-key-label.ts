import type { TFunction } from 'i18next';

/** Fallback when no translation exists: `app_logo` → `App Logo`. */
export function formatSettingKeyFallback(raw: string) {
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

/** Human-readable label for a system setting key. */
export function settingKeyLabel(t: TFunction, key: string) {
  return t(`form.settingsKeys.${key}`, { defaultValue: formatSettingKeyFallback(key) });
}
