/** Body for `POST /admin/toggle-status` (full URL depends on `VITE_SERVER_URL`, often `/api/admin/toggle-status`). */
export const ADMIN_TOGGLE_ENTITY_TYPES = [
  'vendor_user',
  'vendor_package',
  'vendor',
  'user_basket_schedule',
  'user',
  'system_setting',
  'store_user',
  'store',
  'shop',
  'schedule',
  'sale_country',
  'recipe',
  'promotion',
  'point_rule',
  'payment_method',
  'package',
  'product',
  'media',
  'language',
  'icon',
  'currency',
  'category',
  'basket',
  'basket_schedule',
  'driver',
  'country',
  'brand',
  'banner',
  'faq',
  'service',
  'area',
  'city',
  'governorate',
  'badge',
  'color',
  'coupon',
  'page_section',
] as const;

export type AdminToggleEntityType = (typeof ADMIN_TOGGLE_ENTITY_TYPES)[number];

export interface AdminToggleStatusPayload {
  type: AdminToggleEntityType;
  id: number | string;
  is_active: boolean;
}
