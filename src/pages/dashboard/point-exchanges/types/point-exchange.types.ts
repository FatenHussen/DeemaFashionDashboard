// ----------------------------------------------------------------------

export type PointExchangeStatus = 'approved' | 'rejected' | 'pending';

export interface PointExchangeUser {
  id: number;
  name: string;
  email: string;
}

export interface PointExchangeItem {
  id: number;
  user: PointExchangeUser;
  points: number;
  status: PointExchangeStatus;
  created_at: string;
  updated_at: string;
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
  points: number;
  status: PointExchangeStatus;
  created_at: string;
  updated_at: string;
}

export interface PointExchangeDetailsResponse {
  status: boolean;
  message: string;
  data: PointExchangeDetailsData;
}

export interface PointExchangeUpdateStatusPayload {
  status: PointExchangeStatus;
}
