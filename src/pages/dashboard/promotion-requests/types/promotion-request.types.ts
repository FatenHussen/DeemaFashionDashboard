// ----------------------------------------------------------------------

export interface PromotionRequestItem {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  promotion: {
    id: number;
    name: { en: string; ar: string } | string;
  };
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  created_at: string;
}

export interface PromotionRequestListResponse {
  status: boolean;
  message: string;
  data: {
    items: PromotionRequestItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface PromotionRequestDetailsResponse {
  status: boolean;
  message: string;
  data: PromotionRequestItem;
}
