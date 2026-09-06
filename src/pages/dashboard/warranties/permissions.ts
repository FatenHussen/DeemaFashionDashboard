/**
 * Laravel admin permission keys for the Warranty resource (singular).
 * Do not derive these from the `/warranties` route.
 */
export const WARRANTY_PERMISSION = {
  view: 'warranty.view',
  create: 'warranty.create',
  update: 'warranty.update',
  delete: 'warranty.delete',
} as const;

export type WarrantyPermissionAction = keyof typeof WARRANTY_PERMISSION;
