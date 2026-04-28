// ----------------------------------------------------------------------

export interface PointRuleItem {
  id: number;
  code: string;
  title: string | { en: string; ar: string };
  type: string;
  value: number;
  min_order_amount: number | null;
  expires_after_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PointRuleListResponse {
  status: boolean;
  message: string;
  data: {
    items: PointRuleItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface PointRuleDetailsResponse {
  status: boolean;
  message: string;
  data: PointRuleItem;
}

export interface PointRuleCreatePayload {
  title: { en: string; ar: string };
  type: string;
  value: number;
  min_order_amount?: number | null;
  expires_after_days: number;
  is_active: boolean;
}
