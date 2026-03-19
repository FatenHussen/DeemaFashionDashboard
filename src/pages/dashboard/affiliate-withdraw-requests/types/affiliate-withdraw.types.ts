export interface AffiliateInfo {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface AffiliateWithdrawItem {
  id: number;
  affiliate_id: string;
  affiliate: AffiliateInfo;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  note: string | null;
  created_at: string;
  updated_at?: string;
}

export interface AffiliateWithdrawListResponse {
  status: boolean;
  message: string;
  data: {
    items: AffiliateWithdrawItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface AffiliateWithdrawDetailsResponse {
  status: boolean;
  message: string;
  data: AffiliateWithdrawItem;
}

export interface AffiliateWithdrawUpdatePayload {
  status: 'approved' | 'rejected';
  note?: string;
}
