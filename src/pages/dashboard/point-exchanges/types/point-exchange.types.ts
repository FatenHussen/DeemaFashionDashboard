// ----------------------------------------------------------------------

export type PointExchangeStatus = 'approved' | 'rejected' | 'pending' | 'completed';

export type PointExchangeType = 'free_delivery' | 'gift' | string;

export interface PointExchangeUser {
  id: number;
  name: string;
  email?: string;
}

export interface PointExchangeItem {
  id: number;
  user: PointExchangeUser;
  exchange_type?: PointExchangeType;
  status: PointExchangeStatus;
  points?: number;
  points_used?: number;
  delivered_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface PointExchangeListResponse {
  status: boolean;
  message: string;
  data: {
    items: PointExchangeItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface PointExchangeDetailsData {
  id: number;
  user: PointExchangeUser;
  exchange_type?: PointExchangeType;
  status: PointExchangeStatus;
  points?: number;
  points_used?: number;
  delivered_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface PointExchangeDetailsResponse {
  status: boolean;
  message: string;
  data: PointExchangeDetailsData;
}

export interface PointExchangeUpdateStatusPayload {
  status: PointExchangeStatus;
}
