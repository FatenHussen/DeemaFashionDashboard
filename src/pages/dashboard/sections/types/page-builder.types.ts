import type { Pagination, PageSectionListItem } from './page-section.types';

// ----------------------------------------------------------------------

/** Row returned by `GET /api/admin/pages` (paginated list). */
export interface PageBuilderListItem {
  id: number;
  title: string | { ar?: string; en?: string };
  slug: string;
  filters?: Record<string, unknown> | null;
  sections_count?: number;
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
};

// ----------------------------------------------------------------------

export type UnifiedSectionType = 'manual' | 'api';

/** The unified endpoint still accepts `horizontal` (its default), unlike the legacy page-section form. */
export type UnifiedSectionVariant = 'horizontal' | 'vertical' | 'square';

/**
 * Payload for `POST /api/admin/pages/{page}/sections` — creates a Section and
 * links it to the page in a single transaction.
 */
export interface UnifiedSectionCreatePayload {
  type: UnifiedSectionType;
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
