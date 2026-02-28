// ----------------------------------------------------------------------

// ── List response  GET /admin/user-points ────────────────────────────

export interface UserWallet {
  balance: number;
  last_earned_at?: string;
  expire_at?: string;
}

export interface UserPointsItem {
  id: number;
  name: string;
  email: string;
  phone?: string;
  wallet: UserWallet;
  total_transactions: number;
  total_earned: string | number;
  total_redeemed: number;
  created_at: string;
}

export interface UserPointsListResponse {
  success: boolean;
  data: {
    items: UserPointsItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

// ── Details response  GET /admin/user-points/{id} ────────────────────

export interface UserPointsDetailsUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at?: string;
}

export interface UserPointsDetailsWallet {
  id?: number;
  balance: number;
  last_earned_at?: string;
  expire_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserPointsStatistics {
  total_transactions: number;
  total_earned: string | number;
  total_redeemed: number;
  pending_transactions: number;
}

export interface PointTransactionRule {
  id: number;
  code: string;
  title: string;
}

export interface UserPointTransaction {
  id: number;
  points: number;
  source: string;
  status: 'earned' | 'redeemed' | string;
  reason: string | null;
  rule?: PointTransactionRule | null;
  admin?: any | null;
  reference_type?: string;
  reference_id?: number;
  expires_at?: string;
  created_at: string;
}

export interface UserPointsDetailsData {
  user: UserPointsDetailsUser;
  wallet: UserPointsDetailsWallet;
  statistics: UserPointsStatistics;
  recent_transactions: UserPointTransaction[];
}

export interface UserPointsDetailsResponse {
  status: boolean;
  message: string;
  data: UserPointsDetailsData;
}

// ── Transactions response  GET /admin/user-points/{id}/transactions ──

export interface UserPointsTransactionsResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
    };
    items: UserPointTransaction[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

// ── Statistics response ──────────────────────────────────────────────

export interface UserPointsStatisticsResponse {
  success: boolean;
  data: {
    total_users_with_points: number;
    total_points_in_system: number;
    total_points_earned: number;
    total_points_redeemed: number;
    total_transactions: number;
    average_balance_per_user: number;
  };
}

// ── Add / Deduct payload ─────────────────────────────────────────────

export interface UserPointsAddDeductPayload {
  points: number;
  reason: string;
}
