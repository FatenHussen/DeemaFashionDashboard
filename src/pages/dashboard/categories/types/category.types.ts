// ----------------------------------------------------------------------

export interface ParentCategory {
  id: number;
  name: string;
}

export interface CategoryData {
  id: number;
  name: string;
  description: string;
  icon: string | null;
  parent_id: number | null;
  parent: ParentCategory | null;
  /** true when parent_id === null — root/main category. */
  is_root?: boolean;
  order: number | null;
  is_active: boolean;
  is_restaurant: boolean;
  children_count: number;
  /** true when this category has at least one child. Does not block product assignment. */
  has_children?: boolean;
  /** Auto-generated page of this category (page builder). */
  page_id?: number | null;
  /** true when the page was auto-created with the category (the normal case). */
  page_is_auto?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryListResponse {
  status: boolean;
  message: string;
  data: {
    items: CategoryData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface CategoryDetailData {
  id: number;
  name: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  icon: string | null;
  parent_id: number | null;
  parent: ParentCategory | null;
  /** true when parent_id === null — root/main category. */
  is_root?: boolean;
  order: number | null;
  is_active: boolean;
  is_restaurant: boolean;
  children: CategoryData[];
  children_count?: number;
  /** true when this category has at least one child. Does not block product assignment. */
  has_children?: boolean;
  /** Auto-generated page of this category (page builder). */
  page_id?: number | null;
  /** true when the page was auto-created with the category (the normal case). */
  page_is_auto?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryDetailResponse {
  status: boolean;
  message: string;
  data: CategoryDetailData;
}

export interface CategoryCreateUpdatePayload {
  name: {
    en: string;
    ar: string;
  };
  icon?: File | null;
  parent_id?: number | null;
  order?: number | null;
  is_active?: boolean;
  is_restaurant?: boolean;
}

// ----------------------------------------------------------------------
// Delete impact preview

export interface CategoryDeleteWarning {
  key: string;
  count: number;
  /** Already translated server-side per the request's language. */
  message: string;
}

export interface CategoryDeleteImpactData {
  type: string;
  id: number;
  name: { ar: string; en: string } | string;
  requires_confirmation: boolean;
  counts?: Partial<{
    child_categories: number;
    products: number;
    baskets: number;
    pages: number;
    recipe_links: number;
  }>;
  warnings?: CategoryDeleteWarning[];
}

export interface CategoryDeleteImpactResponse {
  status: boolean;
  message: string;
  data: CategoryDeleteImpactData;
}

export type CategoryLinkedItemType =
  | 'child_category'
  | 'product'
  | 'basket'
  | 'page'
  | 'recipe_link'
  | string;

export interface CategoryLinkedItem {
  type: CategoryLinkedItemType;
  id: number;
  name?: string | { ar?: string; en?: string };
  image?: string | null;
  icon?: string | null;
  product_number?: string | null;
  sku?: string | null;
  /** Optional secondary label (e.g. parent name). */
  meta?: string | null;
}

export interface CategoryLinkedItemsResponse {
  status: boolean;
  message: string;
  data: {
    items: CategoryLinkedItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

