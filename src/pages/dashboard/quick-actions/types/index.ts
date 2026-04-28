export interface QuickActionPageSummary {
  id: number;
  title: string;
  slug: string;
}

export interface QuickActionListItem {
  id: number;
  title: string;
  page?: QuickActionPageSummary;
  icon: string;
  order: number;
  is_active: boolean;
  created_at?: string;
  [key: string]: unknown;
}

export interface QuickActionListResponse {
  status: boolean;
  message: string;
  data: {
    items: QuickActionListItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface QuickActionDetail {
  id: number;
  title: { en: string; ar: string };
  page_id: number;
  page?: QuickActionPageSummary;
  icon: string;
  order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface QuickActionDetailResponse {
  status: boolean;
  message: string;
  data: QuickActionDetail;
}
