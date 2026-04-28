import type { TFunction } from 'i18next';

import { formatPermissionLabel } from '@/lib/format-permission-label';

function normalizePermissionKey(raw: string): string {
  return raw.trim().replace(/\s+/g, '').toLowerCase();
}

function resourceI18nKey(resource: string): string {
  return resource.replace(/\./g, '_');
}

export function translatePermissionName(name: string, t: TFunction<'table'>): string {
  return formatPermissionLabel(name, t);
}

export function translatePermissionResource(resource: string, t: TFunction<'table'>): string {
  const rk = resourceI18nKey(normalizePermissionKey(resource));
  return t(`permResource.${rk}` as any, {
    defaultValue: resource,
  });
}
