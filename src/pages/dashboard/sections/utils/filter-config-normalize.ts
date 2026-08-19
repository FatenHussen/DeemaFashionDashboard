import type { FilterConfig } from '../types/page-section.types';

import { apiRoutes } from '@/api';

/** Known entity-id filters — always render as a searchable dropdown, never a raw number field. */
const ENTITY_FILTER_URLS: Record<string, string> = {
  category_id: apiRoutes.category.list,
  sub_category_id: apiRoutes.category.list,
  child_category_id: apiRoutes.category.list,
  second_category_id: apiRoutes.category.list,
  parent_id: apiRoutes.category.list,
  brand_id: apiRoutes.brand.list,
  shop_id: apiRoutes.shop.list,
  vendor_id: apiRoutes.vendor.list,
  product_id: apiRoutes.product.list,
  page_id: apiRoutes.pageSection.pages,
};

/**
 * Upgrades backend filter schemas so admins pick entities by name, not by numeric id.
 * e.g. `{ type: 'number' }` for `category_id` becomes `{ type: 'select', url: '/admin/categories' }`.
 */
export function normalizeFilterConfig(filterKey: string, config: FilterConfig): FilterConfig {
  const entityUrl = ENTITY_FILTER_URLS[filterKey];
  if (!entityUrl) return config;

  if (config.type === 'select') {
    if (config.url) return config;
    if (Array.isArray(config.items) && config.items.length > 0) return config;
    return { type: 'select', url: entityUrl };
  }

  return { type: 'select', url: entityUrl };
}

export function normalizeFilterSchema(
  schema: Record<string, FilterConfig>
): Record<string, FilterConfig> {
  const result: Record<string, FilterConfig> = {};
  for (const [key, config] of Object.entries(schema)) {
    result[key] = normalizeFilterConfig(key, config);
  }
  return result;
}
