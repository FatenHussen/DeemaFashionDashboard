// ----------------------------------------------------------------------

export interface ComplaintUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface ComplaintItem {
  id: number;
  order_id: number;
  message: string;
  status: 'new' | 'rejected' | 'resolved';
  type: 'product' | 'order';
  admin_response: string | null;
  images: string[];
  user: ComplaintUser;
  created_at: string;
}

export interface ComplaintListResponse {
  status: boolean;
  message: string;
  data: {
    items: ComplaintItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface ComplaintOrderUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface ComplaintOrder {
  id: number;
  status: string;
  cart_type: string;
  is_instant_delivery: boolean;
  delivery_price: number;
  total: number;
  subtotal: number;
  total_with_delivery: number;
  total_quantity: number;
  basket_discount: number;
  coupon_discount: number;
  created_at: string;
  affiliate_rate: number | null;
  affiliate_source: string;
  affiliate_commission: number;
  user: ComplaintOrderUser;
}

export interface ComplaintDetailsData extends ComplaintItem {
  order?: ComplaintOrder;
}

export interface ComplaintDetailsResponse {
  status: boolean;
  message: string;
  data: ComplaintDetailsData;
}

export interface ComplaintUpdatePayload {
  status: 'rejected' | 'resolved';
  admin_response: string;
}
