export type ServiceOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'canceled'
  | 'rejected';

export const FINAL_STATUSES: ServiceOrderStatus[] = ['completed', 'canceled', 'rejected'];

export interface ServiceOrderData {
  id: number;
  status: ServiceOrderStatus;
  user?: { id: number; name?: string; email?: string };
  user_id?: number;
  shop?: { id: number; name: string | { ar?: string; en?: string } };
  shop_id?: number;
  vendor_service?: { id: number; name: string | { ar?: string; en?: string } };
  vendor_service_id?: number;
  shop_vendor_service?: {
    id: number;
    price?: number;
    price_unit?: string;
    duration_minutes?: number;
  };
  notes?: string | null;
  scheduled_at?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface ServiceOrderListResponse {
  status: boolean;
  message: string;
  data: {
    items: ServiceOrderData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}
