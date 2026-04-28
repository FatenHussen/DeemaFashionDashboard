export type VendorCommissionType = 'percentage' | 'fixed';
export type VendorSettlementCycle = 'weekly' | 'monthly';

export interface VendorWallet {
  orders_count: number;
  /** Present when API returns per-wallet commission settings */
  commission_type?: VendorCommissionType;
  commission_rate?: number;
  fixed_commission?: number | null;
  gross_sales: number;
  platform_commission: number;
  discounts_share: number;
  refunds: number;
  net_due: number;
  paid: number;
  pending_withdrawals: number;
  remaining_after_paid: number;
  available_for_withdraw: number;
}

export interface VendorItem {
  id: number;
  name: Record<string, string>;
  name_translations: Record<string, string>;
  owner_name: string;
  commission_rate?: number;
  commission_type?: VendorCommissionType;
  fixed_commission?: number | null;
  settlement_cycle?: VendorSettlementCycle;
  /** ISO date string from API, ready to display */
  next_settlement_at?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface VendorAccountingRow {
  vendor: VendorItem;
  wallet: VendorWallet;
}

export interface VendorAccountingSummary {
  vendors_count: number;
  active_vendors_count: number;
  gross_sales: number;
  platform_commission: number;
  discounts_share: number;
  refunds: number;
  net_due: number;
  paid: number;
  pending_withdrawals: number;
  remaining_after_paid: number;
  available_for_withdraw: number;
}

export interface VendorAccountingPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface VendorAccountingSummaryResponse {
  status: boolean;
  message: string;
  data: VendorAccountingSummary;
}

export interface VendorAccountingVendorsResponse {
  status: boolean;
  message: string;
  data: {
    items: VendorAccountingRow[];
    pagination: VendorAccountingPagination;
  };
}

export interface VendorStatementResponse {
  status: boolean;
  message: string;
  data: {
    vendor: VendorItem;
    wallet: VendorWallet;
    withdraw_requests: {
      items: WithdrawRequest[];
      pagination: VendorAccountingPagination;
    };
  };
}

export type WithdrawStatus = 'pending' | 'paid' | 'rejected';
export type PaymentMethod = 'bank_transfer' | 'cash' | 'wallet' | 'other';

export interface WithdrawRequest {
  id: number;
  vendor?: VendorItem;
  amount: number;
  status: WithdrawStatus;
  payment_method: PaymentMethod | null;
  transfer_reference: string | null;
  note: string | null;
  rejection_reason: string | null;
  requested_at: string | null;
  processed_at: string | null;
  created_at: string | null;
}

export interface WithdrawRequestsResponse {
  status: boolean;
  message: string;
  data: {
    items: WithdrawRequest[];
    pagination: VendorAccountingPagination;
  };
}

export interface WithdrawRequestDetailResponse {
  status: boolean;
  message: string;
  data: WithdrawRequest;
}

export type UpdateWithdrawPayload =
  | {
      status: 'paid';
      payment_method: PaymentMethod;
      transfer_reference?: string;
      note?: string;
    }
  | {
      status: 'rejected';
      rejection_reason: string;
      note?: string;
    };
