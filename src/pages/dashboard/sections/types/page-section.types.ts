// ----------------------------------------------------------------------

export interface PageSectionListItem {
  id: number;
  name: string;
  type: 'api' | 'manual';
  position: 'before' | 'after';
  order: number;
  display_type_id: number;
  background_color: string | null;
  background_card_color: string | null;
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
  type: 'select' | 'number';
  url?: string;
}

export interface SectionFilters {
  [key: string]: FilterConfig;
}

export interface SectionItem {
  id: number;
  name: string;
  type: 'api' | 'manual';
  filters: SectionFilters | null | any[];
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
  title: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface PagesResponse {
  status: boolean;
  message: string;
  data: Page[];
}

export interface DisplayType {
  id: number;
  manual_model: string;
  image_url: string;
  fields: string[];
  created_at: string;
}

export interface DisplayTypesResponse {
  status: boolean;
  message: string;
  data: DisplayType[];
}

export interface PageSectionCreateUpdatePayload {
  name: {
    en: string;
    ar: string;
  };
  section_id: string | number;
  page_id: string | number;
  display_type_id: number;
  position: 'before' | 'after';
  order: number;
  background_color?: string;
  background_card_color?: string;
  filters?: {
    [key: string]: any;
  };
}
