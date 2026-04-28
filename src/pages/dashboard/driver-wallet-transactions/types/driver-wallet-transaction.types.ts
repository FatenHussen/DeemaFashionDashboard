export type DriverWalletTransactionType = 'paid_by_user' | 'paid_by_system';

export interface DriverWalletTransactionDriver {
  id: number;
  name: string;
  email: string;
  phone: string;
  image_url?: string | null;
}

export interface DriverWalletTransactionOrderSummary {
  id: number;
  status: string;
}

export interface DriverWalletTransactionItem {
  id: number;
  driver_id: number;
  driver: DriverWalletTransactionDriver;
  type: DriverWalletTransactionType;
  amount: number;
  delivery_fee: number;
  rate_percent: number;
  order_id: number | null;
  order_number?: number | null;
  created_at: string;
  updated_at?: string;
  order?: DriverWalletTransactionOrderSummary | null;
}

export interface DriverWalletTransactionListResponse {
  status: boolean;
  message: string;
  data: {
    items: DriverWalletTransactionItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface DriverWalletTransactionDetailsResponse {
  status: boolean;
  message: string;
  data: DriverWalletTransactionItem;
}

export interface DriverWalletTransactionListParams {
  page?: number;
  per_page?: number;
  search?: string;
  type?: DriverWalletTransactionType;
  driver_id?: number | string;
  order_id?: number;
  from?: string;
  to?: string;
  min_amount?: number;
  max_amount?: number;
  sort_field?: 'id' | 'created_at' | 'amount' | 'type';
  sort_order?: 'asc' | 'desc';
}
