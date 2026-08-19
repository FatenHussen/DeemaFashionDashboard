import type { Pagination, PageSectionListItem } from './page-section.types';

// ----------------------------------------------------------------------

/** Row returned by `GET /api/admin/pages` (paginated list). */
export interface PageBuilderListItem {
  id: number;
  title: string | { ar?: string; en?: string };
  slug: string;
  filters?: Record<string, unknown> | null;
  sections_count?: number;
  /** Auto-generated page that belongs to a category — never created/deleted manually. */
  is_category_page?: boolean;
  /** Linked category id when `is_category_page` is true. */
  category_id?: number | null;
  /** `false` on category pages — deletion happens via `DELETE /admin/categories/{id}`. */
  can_delete_page?: boolean;
  /** `false` on category pages — title/slug follow the category and reject direct edits (422). */
  can_edit_metadata?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PageBuilderListResponse {
  status: boolean;
  message: string;
  data: {
    items: PageBuilderListItem[];
    pagination: Pagination;
  };
}

/** `GET /api/admin/pages/{page}` — page with its linked sections (AdminOneResource shape). */
export interface PageBuilderDetails extends PageBuilderListItem {
  sections?: PageSectionListItem[];
  /** Category pages only: the endpoint that actually removes this page, e.g. `DELETE /api/admin/categories/12`. */
  delete_page_via?: string;
}

export interface PageBuilderDetailsResponse {
  status: boolean;
  message: string;
  data: PageBuilderDetails;
}

export interface PageCreateUpdatePayload {
  title: string;
  /** Optional — derived from `title` server-side when omitted. Must be unique. */
  slug?: string;
  filters?: Record<string, unknown>;
}

export type PageBuilderListQueryParams = {
  page?: number;
  per_page?: number;
  search?: string;
  sort_field?: string;
  sort_order?: string;
  /** `content` = regular pages only, `category` = auto category pages only. Omit for all. */
  type?: 'content' | 'category';
  /** Returns the page of one specific category. */
  category_id?: number;
};

// ----------------------------------------------------------------------

export type UnifiedSectionType = 'manual' | 'api';

/** The unified endpoint still accepts `horizontal` (its default), unlike the legacy page-section form. */
export type UnifiedSectionVariant = 'horizontal' | 'vertical' | 'square';

/** Row returned by `GET /api/admin/pages/{page}/sliders` — the whole slider library. */
export interface SliderLibraryItem {
  id: number;
  name: string | { ar?: string; en?: string };
  content_type?: string;
  type?: UnifiedSectionType;
  variant?: string;
  background_color?: string | null;
  background_card_color?: string | null;
  /** How many pages already use this slider. */
  pages_count?: number;
}

export interface SliderLibraryResponse {
  status: boolean;
  message: string;
  data: {
    items: SliderLibraryItem[];
    pagination: Pagination;
  };
}

export type SliderLibraryQueryParams = {
  page?: number;
  per_page?: number;
  search?: string;
  content_type?: string;
  type?: UnifiedSectionType;
};

/**
 * Payload for `POST /api/admin/pages/{page}/sections` — creates a Section and
 * links it to the page in a single transaction. Alternatively pass `section_id`
 * to link an existing library slider (name/variant/colors are copied from it).
 */
export interface UnifiedSectionCreatePayload {
  type?: UnifiedSectionType;
  /** Link-existing mode: id of a library slider. All other content fields are ignored. */
  section_id?: number;
  name?: { ar: string; en: string };
  /** Required when `type=manual`. */
  manual_model?: string;
  /** Required when `type=manual`. */
  item_ids?: Array<{ item_id: number; link: string | null; order: number }>;
  /** Required when `type=api`. */
  api_method?: string;
  /** Display filters applied at the page-link level (effective for `api` sections). */
  filters?: Record<string, unknown>;
  position?: 'before' | 'after';
  /** Defaults to last order + 1 server-side. */
  order?: number;
  variant?: UnifiedSectionVariant;
  background_color?: string;
  background_card_color?: string;
  show_when?: Record<string, unknown>;
}
