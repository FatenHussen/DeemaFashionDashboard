import type { TFunction } from 'i18next';

export function translatePermissionName(name: string, t: TFunction<'table'>): string {
  const dot = name.indexOf('.');
  if (dot === -1) return name;
  const resource = name.slice(0, dot);
  const action = name.slice(dot + 1);
  if (!action) return name;
  return t(`form.permissionLabels.${resource}.${action}` as any, { defaultValue: name });
}

export function translatePermissionResource(resource: string, t: TFunction<'table'>): string {
  return t(`form.permissionResourceLabels.${resource}` as any, { defaultValue: resource });
}
