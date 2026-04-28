export type AffiliateWalletTransactionType = 'commission' | 'withdraw';

export interface AffiliateWalletTransactionAffiliate {
  id: number;
  name: string;
  email: string;
  phone: string;
  image_url?: string | null;
}

export interface AffiliateWalletTransactionOrderSummary {
  id: number;
  status: string;
}

export interface AffiliateWalletTransactionItem {
  id: number;
  affiliate_id: string;
  affiliate: AffiliateWalletTransactionAffiliate;
  type: AffiliateWalletTransactionType;
  amount: number;
  order_id: number | null;
  order_number?: number | null;
  created_at: string;
  updated_at?: string;
  order?: AffiliateWalletTransactionOrderSummary | null;
}

export interface AffiliateWalletTransactionListResponse {
  status: boolean;
  message: string;
  data: {
    items: AffiliateWalletTransactionItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface AffiliateWalletTransactionDetailsResponse {
  status: boolean;
  message: string;
  data: AffiliateWalletTransactionItem;
}

export interface AffiliateWalletTransactionListParams {
  page?: number;
  per_page?: number;
  search?: string;
  type?: AffiliateWalletTransactionType;
  affiliate_id?: string;
  order_id?: number;
  from?: string;
  to?: string;
  min_amount?: number;
  max_amount?: number;
  sort_field?: 'id' | 'created_at' | 'amount' | 'type';
  sort_order?: 'asc' | 'desc';
}
