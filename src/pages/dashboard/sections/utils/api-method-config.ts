import type { TFunction } from 'i18next';
import type { FilterConfig } from '../types/page-section.types';

import { apiRoutes } from '@/api';

// ----------------------------------------------------------------------

/**
 * `api_method` values accepted when creating an automatic (`type=api`) section.
 */
export const API_METHODS = [
  'products',
  'categories',
  'shops',
  'restaurants',
  'brands',
  'recipes',
  'baskets',
  'schedule-basket',
  'suggested_products',
  'suggested_shops',
  'suggested_baskets',
] as const;

export type ApiMethod = (typeof API_METHODS)[number];

const categorySelect: FilterConfig = { type: 'select', url: apiRoutes.category.list };
const brandSelect: FilterConfig = { type: 'select', url: apiRoutes.brand.list };
const shopSelect: FilterConfig = { type: 'select', url: apiRoutes.shop.list };

const PRODUCT_TYPES = [
  'new',
  'trend',
  'top_rated',
  'offers',
  'latest_flash_sale',
  'recommended',
  'for_you',
  'search_based',
] as const;

const SHOP_FEED_TYPES = ['nearby', 'offers', 'active', 'top_rated', 'free_delivery'] as const;

const SHOP_KINDS = ['store', 'restaurant', 'service_provider'] as const;

export const API_METHOD_FILTERS: Record<ApiMethod, Record<string, FilterConfig>> = {
  products: {
    type: { type: 'select', items: [...PRODUCT_TYPES] },
    category_id: categorySelect,
    brand_id: brandSelect,
    shop_id: shopSelect,
  },
  shops: {
    type: { type: 'select', items: [...SHOP_FEED_TYPES] },
    shop_type: { type: 'select', items: [...SHOP_KINDS] },
  },
  restaurants: {
    type: { type: 'select', items: [...SHOP_FEED_TYPES] },
  },
  brands: {},
  categories: {},
  recipes: {},
  baskets: {},
  'schedule-basket': {
    schedule_days: { type: 'select', items: ['7', '15', '30'] },
  },
  suggested_products: {},
  suggested_shops: {},
  suggested_baskets: {},
};

export const PRIMARY_API_FILTER_KEYS = ['type', 'shop_type', 'schedule_days'] as const;

export function apiMethodLabel(t: TFunction<'table'>, method: string): string {
  return t(`form.pageBuilderApiMethods.${method}`, { defaultValue: method });
}

export function apiMethodOptions(t: TFunction<'table'>) {
  return API_METHODS.map((method) => ({
    value: method,
    label: apiMethodLabel(t, method),
  }));
}
