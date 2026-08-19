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

