import type { FilterConfig } from './page-section.types';

// ----------------------------------------------------------------------

export interface PagePreviewPage {
  id: number;
  slug: string;
  title: string;
  filters?: Record<string, FilterConfig> | null;
  /** Auto page of a category — deleted only via its category, title follows the category name. */
  is_category_page?: boolean;
  category_id?: number | null;
  can_delete_page?: boolean;
  can_edit_metadata?: boolean;
  /** Category pages only: the endpoint that actually removes this page. */
  delete_page_via?: string;
}

export type PagePreviewQueryParams = Record<string, string | number>;

export interface PagePreviewSectionAction {
  page_slug?: string | null;
}

export interface PagePreviewSeeMore {
  page_slug?: string | null;
  params?: Record<string, unknown> | unknown[];
}

export interface PagePreviewSection {
  id: number;
  name: string;
  type: 'api' | 'manual';
  position: 'before' | 'after';
  order: number;
  /** Category pages: two default sections are auto-generated (`is_default: true`). */
  is_default?: boolean;
  display_type_id?: number;
  variant?: string;
  content_type?: string;
  manual_model?: string;
  background_color?: string | null;
  background_card_color?: string | null;
  end_date?: string | null;
  discount?: string | number | null;
  discount_type?: string | null;
  see_more?: PagePreviewSeeMore | null;
  show_when?: Record<string, unknown> | null;
  action?: PagePreviewSectionAction | null;
  items: Record<string, unknown>[];
}

export interface PagePreviewData {
  page: PagePreviewPage;
  sections: PagePreviewSection[];
}

export interface PagePreviewResponse {
  status: boolean;
  message: string;
  data: PagePreviewData;
}

export interface PageSectionReorderEntry {
  id: number;
  order: number;
  position: 'before' | 'after';
}

export interface PageSectionReorderPayload {
  sections: PageSectionReorderEntry[];
}

export interface PageSectionReorderResponse {
  status: boolean;
  message: string;
  data?: {
    updated_count: number;
  };
}
