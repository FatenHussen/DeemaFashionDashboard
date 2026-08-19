import type { TFunction } from 'i18next';

/** Fallback when no translation exists: `shop_id` → `Shop Id`. */
export function formatFilterKeyFallback(raw: string) {
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

/** Human-readable label for a page-section filter field key. */
export function filterFieldLabel(t: TFunction, key: string) {
  return t(`form.pageSectionFilterKeys.${key}`, { defaultValue: formatFilterKeyFallback(key) });
}

/** Human-readable label for a static select option inside a filter. */
export function filterOptionLabel(t: TFunction, value: string, filterKey?: string) {
  if (filterKey === 'schedule_days') {
    return t(`form.sectionEasyScheduleDays_${value}`, { defaultValue: value });
  }
  return t(`form.pageSectionFilterValues.${value}`, {
    defaultValue: filterFieldLabel(t, value),
  });
}
