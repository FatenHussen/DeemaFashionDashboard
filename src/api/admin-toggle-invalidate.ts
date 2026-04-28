import type { AdminToggleEntityType } from './admin-toggle-status.types';

/**
 * TanStack Query key roots to invalidate after a successful toggle.
 * Types without a dashboard list here are omitted (list refresh may still be needed manually).
 */
export const ADMIN_TOGGLE_QUERY_ROOT: Partial<Record<AdminToggleEntityType, readonly string[]>> = {
  currency: ['currency'],
  category: ['category'],
  vendor: ['vendor'],
  shop: ['shop'],
  driver: ['driver'],
  country: ['country'],
  sale_country: ['saleCountry'],
  city: ['city'],
  area: ['area'],
  governorate: ['governorate'],
  banner: ['banner'],
  basket: ['basket'],
  faq: ['faq'],
  coupon: ['coupon'],
  recipe: ['recipe'],
  package: ['package'],
  promotion: ['promotion'],
  point_rule: ['pointRule'],
  product: ['product'],
  badge: ['badge'],
  language: ['language'],
  icon: ['icon'],
  color: ['color'],
  user: ['user'],
  vendor_user: ['vendorUser'],
  vendor_package: ['vendorPackage'],
  basket_schedule: ['scheduledBasket'],
  schedule: ['schedule'],
  user_basket_schedule: ['userBasketSchedule'],
  brand: ['brand'],
  service: ['service'],
  system_setting: ['setting'],
};
