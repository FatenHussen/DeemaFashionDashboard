import type { TFunction } from 'i18next';
import type { FilterConfig } from '../types/page-section.types';

import { apiRoutes } from '@/api';

import { API_METHOD_FILTERS, type ApiMethod } from './api-method-config';

// ----------------------------------------------------------------------

/** Fixed `content_type` values for the section form (manual picking). */
export const SECTION_CONTENT_TYPES = [
  'banner',
  'product',
  'shop',
  'restaurant',
  'brand',
  'category',
  'recipe',
  'basket',
] as const;

export type SectionContentType = (typeof SECTION_CONTENT_TYPES)[number];

/** Automatic-only feeds that map 1:1 to an `api_method`. */
export const API_EXTRA_CONTENT_TYPES = [
  'schedule-basket',
  'suggested_products',
  'suggested_shops',
  'suggested_baskets',
] as const;

export type ApiSectionContentType = Exclude<SectionContentType, 'banner'> | (typeof API_EXTRA_CONTENT_TYPES)[number];

export const API_SECTION_CONTENT_TYPES: readonly ApiSectionContentType[] = [
  'product',
  'shop',
  'restaurant',
  'brand',
  'category',
  'recipe',
  'basket',
  'schedule-basket',
  'suggested_products',
  'suggested_shops',
  'suggested_baskets',
];

export const API_CAPABLE_CONTENT_TYPES: readonly string[] = API_SECTION_CONTENT_TYPES;

export const CONTENT_TYPE_TO_API_METHOD: Record<string, ApiMethod> = {
  product: 'products',
  shop: 'shops',
  restaurant: 'restaurants',
  brand: 'brands',
  category: 'categories',
  recipe: 'recipes',
  basket: 'baskets',
  'schedule-basket': 'schedule-basket',
  suggested_products: 'suggested_products',
  suggested_shops: 'suggested_shops',
  suggested_baskets: 'suggested_baskets',
};

export function contentTypeToApiMethod(contentType: string): ApiMethod | undefined {
  return CONTENT_TYPE_TO_API_METHOD[contentType];
}

export function apiMethodToContentType(method?: string): string {
  if (!method) return '';
  const entry = Object.entries(CONTENT_TYPE_TO_API_METHOD).find(([, value]) => value === method);
  return entry?.[0] ?? '';
}

export function isApiOnlyContentType(contentType: string): boolean {
  return (API_EXTRA_CONTENT_TYPES as readonly string[]).includes(contentType);
}

export function isBannerContentType(contentType: string | undefined | null): boolean {
  return (contentType ?? '').trim().toLowerCase() === 'banner';
}

/**
 * Home "quick order" block is settings-driven (`quick_order_*` keys), not a CMS section.
 * Backend may still inject it into page preview — exclude from the page builder UI.
 */
const QUICK_ORDER_CONTENT_TYPES = new Set([
  'quick_order',
  'quick-order',
  'custom_order',
  'custom-order',
  'custom_order_request',
]);

export function isQuickOrderContentType(contentType: string | undefined | null): boolean {
  const key = (contentType ?? '').trim().toLowerCase();
  return Boolean(key) && QUICK_ORDER_CONTENT_TYPES.has(key);
}

export function isQuickOrderSection(section: {
  content_type?: string | null;
  manual_model?: string | null;
  type?: string | null;
  api_method?: string | null;
}): boolean {
  return (
    isQuickOrderContentType(section.content_type) ||
    isQuickOrderContentType(section.manual_model) ||
    isQuickOrderContentType(section.type) ||
    isQuickOrderContentType(section.api_method)
  );
}

/** Home / landing CMS page — where the settings-driven quick-order block appears in the app. */
export function isHomeCmsPage(page?: { slug?: string | null; id?: number | string | null } | null): boolean {
  const slug = (page?.slug ?? '').trim().toLowerCase();
  if (slug === 'home' || slug === 'index' || slug === 'main') return true;
  // Seeded home is usually page id 1 in this project.
  return String(page?.id ?? '') === '1';
}

/** Every pickable content type in section create step 2 (manual + api-only extras). */
export const ALL_SECTION_CONTENT_TYPES: readonly string[] = [
  ...SECTION_CONTENT_TYPES,
  ...API_EXTRA_CONTENT_TYPES.filter(
    (type) => !(SECTION_CONTENT_TYPES as readonly string[]).includes(type)
  ),
];

/**
 * Where the dashboard picks manual items from, per content type.
 * `restaurant` and `shop` share the shops endpoint split by `is_restaurant`.
 */
export const CONTENT_TYPE_ITEM_SOURCES: Record<
  SectionContentType,
  { url: string; params?: Record<string, unknown> }
> = {
  banner: { url: apiRoutes.banner.list },
  product: { url: apiRoutes.product.list },
  shop: { url: apiRoutes.shop.list, params: { is_restaurant: 0 } },
  restaurant: { url: apiRoutes.shop.list, params: { is_restaurant: 1 } },
  brand: { url: apiRoutes.brand.list },
  category: { url: apiRoutes.category.list },
  recipe: { url: apiRoutes.recipe.list },
  basket: { url: apiRoutes.basket.list },
};

/**
 * List filters shown above manual item pickers (search is always separate).
 * Product sections get category / brand / shop dropdowns per backend docs.
 */
export const MANUAL_ITEM_PICKER_FILTERS: Partial<
  Record<SectionContentType, Record<string, FilterConfig>>
> = {
  product: {
    category_id: { type: 'select', url: apiRoutes.category.list },
    brand_id: { type: 'select', url: apiRoutes.brand.list },
    shop_id: { type: 'select', url: apiRoutes.shop.list },
    vendor_id: { type: 'select', url: apiRoutes.vendor.list },
  },
};

/** Display filters offered for `type=api` sections, per content type. */
export const CONTENT_TYPE_API_FILTERS: Record<string, Record<string, FilterConfig>> = {
  banner: {},
  product: API_METHOD_FILTERS.products,
  shop: API_METHOD_FILTERS.shops,
  restaurant: API_METHOD_FILTERS.restaurants,
  brand: API_METHOD_FILTERS.brands,
  category: API_METHOD_FILTERS.categories,
  recipe: API_METHOD_FILTERS.recipes,
  basket: API_METHOD_FILTERS.baskets,
  'schedule-basket': API_METHOD_FILTERS['schedule-basket'],
  suggested_products: API_METHOD_FILTERS.suggested_products,
  suggested_shops: API_METHOD_FILTERS.suggested_shops,
  suggested_baskets: API_METHOD_FILTERS.suggested_baskets,
};

export function contentTypeLabel(t: TFunction<'table'>, contentType: string): string {
  return t(`form.sectionEasyContent_${contentType}`, {
    defaultValue: t(`form.pageSectionFilterValues.${contentType}`, {
      defaultValue: contentType.charAt(0).toUpperCase() + contentType.slice(1).replace(/-/g, ' '),
    }),
  });
}

export function contentTypeOptions(t: TFunction<'table'>, contentTypes?: readonly string[]) {
  return (contentTypes ?? SECTION_CONTENT_TYPES).map((type) => ({
    value: type,
    label: contentTypeLabel(t, type),
  }));
}

export const CONTENT_TYPE_ICONS: Record<string, string> = {
  product: 'solar:box-bold',
  restaurant: 'solar:chef-hat-bold',
  shop: 'solar:shop-bold',
  banner: 'solar:gallery-bold',
  category: 'solar:widget-4-bold',
  brand: 'solar:medal-star-bold',
  recipe: 'solar:notebook-bold',
  basket: 'solar:bag-bold',
  'schedule-basket': 'solar:calendar-bold',
  suggested_products: 'solar:star-bold',
  suggested_shops: 'solar:map-point-bold',
  suggested_baskets: 'solar:heart-bold',
};

export function autoFeedPreview(
  t: TFunction<'table'>,
  contentType: string,
  filters: Record<string, any>
): string {
  if (contentType.startsWith('suggested_')) {
    return t(`form.sectionEasyPreview_${contentType}`);
  }

  if (contentType === 'schedule-basket') {
    const days = filters.schedule_days;
    if (days) return t(`form.sectionEasyPreview_schedule_${days}`);
    return t('form.sectionEasyPreview_schedule-basket');
  }

  if (contentType === 'product' && filters.type) {
    return t(`form.sectionEasyPreview_product_${filters.type}`, {
      defaultValue: t('form.sectionEasyPreview_product'),
    });
  }

  if (contentType === 'shop') {
    if (filters.shop_type) {
      return t(`form.sectionEasyPreview_shop_${filters.shop_type}`, {
        defaultValue: t('form.sectionEasyPreview_shop'),
      });
    }
    if (filters.type) {
      return t(`form.sectionEasyPreview_shop_${filters.type}`, {
        defaultValue: t('form.sectionEasyPreview_shop'),
      });
    }
    return t('form.sectionEasyPreview_shop');
  }

  if (contentType === 'restaurant' && filters.type) {
    return t(`form.sectionEasyPreview_shop_${filters.type}`, {
      defaultValue: t('form.sectionEasyPreview_restaurant'),
    });
  }

  return t(`form.sectionEasyPreview_${contentType}`, {
    defaultValue: t('form.sectionEasyPreview_default'),
  });
}
