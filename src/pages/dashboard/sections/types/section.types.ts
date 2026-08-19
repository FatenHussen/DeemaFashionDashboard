// ----------------------------------------------------------------------

export interface SectionListItem {
  id: number;
  name: string;
  type: 'api' | 'manual';
  /** What the section shows (banner / product / shop / restaurant / …). */
  content_type?: string;
  /** Display shape: `horizontal` (slider), `vertical` (grid), or `square`. */
  variant?: string | null;
  background_color?: string | null;
  background_card_color?: string | null;
  /** How many pages currently use this section. */
  pages_count?: number;
  is_active?: boolean;
}

export interface SectionListQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  content_type?: string;
  type?: 'api' | 'manual';
  /** `1` = active only, `0` = inactive only. Omit for all. */
  is_active?: 0 | 1;
  category_id?: number;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface SectionListResponse {
  status: boolean;
  message: string;
  data: {
    items: SectionListItem[];
    pagination: Pagination;
  };
}

export interface SectionDetailsItem {
  id: number;
  desc?: string;
  price?: number;
  [key: string]: any;
}

export interface SectionDetails {
  id: number;
  name: string;
  /** Admin-facing bilingual name when API returns it separately from `name`. */
  admin_name?: string | { en: string; ar: string };
  type: 'api' | 'manual';
  /** What the section shows (banner / product / shop / restaurant / …). */
  content_type?: string;
  api?: Record<string, any>;
  manual?: {
    manual_model: string | null;
  };
  /** Feed filters when `type=api`. */
  filters?: Record<string, any> | null;
  /** Display shape — copied to pages that link this section. */
  variant?: string | null;
  background_color?: string | null;
  background_card_color?: string | null;
  pages_count?: number;
  items: SectionDetailsItem[];
}

export interface SectionDetailsResponse {
  status: boolean;
  message: string;
  data: SectionDetails;
}

export interface ItemIdEntry {
  item_id: number;
  /** Omitted/empty for banners — the banner's own link is used at display time. */
  link?: string | null;
  order: number;
}

export interface SectionCreateUpdatePayload {
  name: {
    en: string;
    ar: string;
  };
  /** Simplified content key — mapped server-side to `manual_model` / `api_method`. */
  content_type?: string;
  /** Sent with `type=api` so the backend knows which feed to run. */
  api_method?: string;
  /** `manual` (hand-picked `item_ids`) or `api` (automatic feed with `filters`). */
  type: 'manual' | 'api';
  /** Display shape. Defaults to `horizontal` (slider) server-side. Never send `page_id`. */
  variant?: string;
  background_color?: string;
  background_card_color?: string;
  /** Required when `type=manual`. */
  item_ids?: Array<{
    item_id: number;
    order: number;
    /** Omitted for banners (taken from the banner itself). `null` is allowed for GIF items. */
    link?: string | null;
  }>;
  /** Feed filters when `type=api`. */
  filters?: Record<string, unknown>;
}

export interface ItemTypeEntry {
  item_type: string;
  url: string;
}

export type ItemTypesMap = Record<string, ItemTypeEntry | any[]>;

export interface ItemTypesResponse {
  status: boolean;
  message: string;
  data: ItemTypesMap;
}

export interface ManualItemsListResponse {
  status: boolean;
  message: string;
  data: {
    items: any[];
    pagination?: Pagination;
  };
}
