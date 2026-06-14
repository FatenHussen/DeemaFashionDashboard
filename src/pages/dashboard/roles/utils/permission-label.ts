import type { TFunction } from 'i18next';

import { formatPermissionLabel } from '@/lib/format-permission-label';

function normalizePermissionKey(raw: string): string {
  return raw.trim().replace(/\s+/g, '').toLowerCase();
}

function resourceI18nKey(resource: string): string {
  return resource.replace(/\./g, '_');
}

function capitalize(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function translatePermissionName(name: string, t: TFunction<'table'>): string {
  return formatPermissionLabel(name, t);
}

export function translatePermissionResource(resource: string, t: TFunction<'table'>): string {
  const rk = resourceI18nKey(normalizePermissionKey(resource));
  return t(`common:permResource.${rk}` as any, {
    defaultValue: resource,
  });
}

/**
 * Returns just the localized action label (e.g. "إنشاء" / "Create") for a `resource.action`
 * permission key. Use inside a resource-grouped UI where the resource label is already shown
 * as the group header, so each row doesn't repeat the same resource text.
 */
export function translatePermissionAction(name: string, t: TFunction<'table'>): string {
  const key = normalizePermissionKey(name);
  const parts = key.split('.');
  if (parts.length < 2) return name.trim();
  const action = parts[parts.length - 1] ?? '';
  return t(`common:permAction.${action}` as any, {
    defaultValue: capitalize(action),
  });
}
