import type { TFunction } from 'i18next';
import type { FilterConfig } from '../types/page-section.types';

import { apiRoutes } from '@/api';

// ----------------------------------------------------------------------

/**
 * `api_method` values accepted by `POST /api/admin/pages/{page}/sections`
 * with the display filters each one supports at runtime. The effective
 * filters for `api` sections live on the page link (this payload), not on
 * the Section itself.
 */
export const API_METHODS = [
  'products',
  'categories',
  'shops',
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
const textFilter: FilterConfig = { type: 'text' };
const numberFilter: FilterConfig = { type: 'number' };

export const API_METHOD_FILTERS: Record<ApiMethod, Record<string, FilterConfig>> = {
  products: {
    category_id: categorySelect,
    brand_id: brandSelect,
    shop_id: shopSelect,
    type: textFilter,
    sort_by: textFilter,
    price_min: numberFilter,
    price_max: numberFilter,
  },
  categories: {
    parent_id: categorySelect,
    brand_id: brandSelect,
    shop_id: shopSelect,
    type: textFilter,
    sort_by: textFilter,
  },
  shops: {
    brand_id: brandSelect,
  },
  brands: {},
  recipes: {},
  baskets: {},
  'schedule-basket': {},
  suggested_products: {
    category_id: categorySelect,
    brand_id: brandSelect,
    shop_id: shopSelect,
    type: textFilter,
  },
  suggested_shops: {
    brand_id: brandSelect,
  },
  suggested_baskets: {},
};

/** User-language label for an `api_method` value (falls back to the raw key). */
export function apiMethodLabel(t: TFunction<'table'>, method: string): string {
  return t(`form.pageBuilderApiMethods.${method}`, { defaultValue: method });
}

export function apiMethodOptions(t: TFunction<'table'>) {
  return API_METHODS.map((method) => ({
    value: method,
    label: apiMethodLabel(t, method),
  }));
}
