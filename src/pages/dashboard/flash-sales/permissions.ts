/**
 * Laravel admin permission keys for `FlashSale` / `flashsale` resource.
 * Use these everywhere (routes, nav, `can()`) so they stay in sync with the API.
 */
export const FLASH_SALE_PERMISSION = {
  view: 'flashsale.view',
  create: 'flashsale.create',
  update: 'flashsale.update',
} as const;

export type FlashSalePermissionAction = keyof typeof FLASH_SALE_PERMISSION;
