// ----------------------------------------------------------------------

export interface SectionListItem {
  id: number;
  name: string;
  type: 'api' | 'manual';
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
  api?: Record<string, any>;
  manual?: {
    manual_model: string | null;
  };
  items: SectionDetailsItem[];
}

export interface SectionDetailsResponse {
  status: boolean;
  message: string;
  data: SectionDetails;
}

export interface ItemIdEntry {
  item_id: number;
  link: string;
  order: number;
}

export interface SectionCreateUpdatePayload {
  name: {
    en: string;
    ar: string;
  };
  manual_model: string;
  item_ids: Array<{
    item_id: number;
    order: number;
    /** `null` is allowed for GIF items when no destination URL is set. */
    link: string | null;
  }>;
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
