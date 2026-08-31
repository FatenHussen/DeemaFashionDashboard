// ----------------------------------------------------------------------

/** Display shape of a linked section. Card shape inside the layout. */
export type PageSectionVariant = 'horizontal' | 'vertical' | 'square';

/** How the whole section is arranged on the page. */
export type PageSectionLayout = 'slider' | 'list' | 'grid';

export type PageSectionVariantResponse = PageSectionVariant;

export interface PageSectionListItem {
  id: number;
  name: string | Record<string, string> | unknown[];
  type?: 'api' | 'manual';
  /** The library section this row renders. Changing it swaps the content of the slot. */
  section_id?: number;
  /** Name of the linked section, shown read-only; `name` above is the per-page override. */
  section_name?: string | Record<string, string> | null;
  /** What the linked section serves (`product`, `banner`, and so on). Read-only. */
  content_type?: string;
  /** Owning CMS page. Read-only: a section is moved by re-adding it from the other page. */
  page_id?: number;
  /** Visibility conditions keyed by the owning page's filter schema. */
  show_when?: Record<string, unknown> | null;
  /** Section arrangement: slider | list | grid. */
  layout?: PageSectionLayout | string;
  variant?: PageSectionVariantResponse;
  position?: 'before' | 'after';
  order?: number;
  /** When false, the section stays on the page but is hidden from the user-facing app. */
  is_active?: boolean | 0 | 1;
  is_default?: boolean;
  display_type_id?: number;
  background_color?: string | null;
  background_card_color?: string | null;
  background_crad_color?: string | null;
  filters?: Record<string, unknown> | null;
  [key: string]: any;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PageSectionListResponse {
  status: boolean;
  message: string;
  data: {
    items: PageSectionListItem[];
    pagination: Pagination;
  };
}

export interface PageSectionDetailsResponse {
  status: boolean;
  message: string;
  data: PageSectionListItem;
}

export interface FilterConfig {
  type: 'select' | 'number' | 'text';
  /** When set, options are loaded from this API path (relative to API base). */
  url?: string;
  /** Static enum options for `select` filters (no URL). */
  items?: string[];
}

export interface SectionFilters {
  [key: string]: FilterConfig;
}

export interface SectionItem {
  id: number;
  name: string;
  type: 'api' | 'manual';
  filters: SectionFilters | null | any[];
  manual?: { manual_model: string } | null;
}

export interface SectionsListResponse {
  status: boolean;
  message: string;
  data: {
    items: SectionItem[];
    pagination: Pagination;
  };
}

export interface Page {
  id: number;
  title: string | { ar?: string; en?: string };
  slug: string;
  created_at: string;
  updated_at: string;
  filters?: Record<string, FilterConfig> | null;
  is_category_page?: boolean;
  category_id?: number | null;
  can_delete_page?: boolean;
  can_edit_metadata?: boolean;
  delete_page_via?: string;
}

export interface PagesResponse {
  status: boolean;
  message: string;
  data: Page[];
}

/** Card layout template returned by `GET /sections/display-types`. */
export interface DisplayType {
  id: number;
  image_url: string;
  manual_model?: string;
  fields?: string[];
  created_at?: string;
}

export interface DisplayTypesResponse {
  status: boolean;
  message: string;
  data: DisplayType[];
}

/**
 * Body for `PUT /api/admin/page-sections/{id}`.
 *
 * Every key is optional: send only what the user changed. `page_id` is read-only.
 * Keys inside `filters` must belong to the linked section's own filter schema,
 * otherwise the request comes back `422`.
 */
export interface PageSectionUpdatePayload {
  position?: 'before' | 'after';
  order?: number;
  layout?: PageSectionLayout;
  variant?: PageSectionVariant;
  background_color?: string;
  background_card_color?: string;
  section_id?: number;
  /** Per-page name override. */
  name?: { ar: string; en: string };
  filters?: Record<string, any>;
  show_when?: Record<string, any>;
  /**
   * Backend-owned content-type id (banner/product/…).
   * Do not send from the admin forms — the API derives it from the section.
   */
  display_type_id?: number | null;
}

export interface PageSectionCreateUpdatePayload {
  name: {
    en: string;
    ar: string;
  };
  section_id: string | number;
  page_id: string | number;
  position: 'before' | 'after';
  layout?: PageSectionLayout;
  variant: PageSectionVariant;
  order: number;
  background_color?: string;
  background_card_color?: string;
  filters?: {
    [key: string]: any;
  };
  show_when?: {
    [key: string]: any;
  };
}
