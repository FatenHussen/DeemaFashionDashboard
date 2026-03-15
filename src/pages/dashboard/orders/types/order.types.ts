// ----------------------------------------------------------------------

export type OrderStatus = 'pending' | 'preparing' | 'out_delivery' | 'delivered';

export interface OrderUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export interface OrderItemProduct {
  id: number;
  name: string | { ar?: string; en?: string };
  price: number;
  image?: string;
}

export interface OrderItem {
  id: number;
  product: OrderItemProduct;
  quantity: number;
  price: number;
  status: OrderStatus;
  variant?: {
    id: number;
    attributes?: Array<{ name: string; value: string }>;
  };
}

export interface OrderDriver {
  id: number;
  phone: string;
  address?: string;
  status?: string;
  is_active?: number | boolean;
  rate_per_order?: string | number;
}

export interface OrderData {
  id: number;
  order_number: string;
  status: OrderStatus;
  total: number;
  subtotal?: number;
  delivery_price?: number;
  discount?: number;
  price_after_discount?: number;
  rating?: number;
  user: OrderUser;
  driver?: OrderDriver;
  items: OrderItem[];
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderListResponse {
  status: boolean;
  message: string;
  data: {
    items: OrderData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface OrderDetailAffiliate {
  affiliate_rate: string;
  affiliate_source: string;
  affiliate_commission: number;
}

export interface OrderDetailTimestamps {
  pending_at: string | null;
  preparing_at: string | null;
  out_delivery_at: string | null;
  delivered_at: string | null;
}

export interface OrderDetailUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  affiliate: {
    is_affiliate: boolean;
    affiliate_approved: boolean;
    affiliate_id: string;
  };
  created_at: string;
}

export interface OrderDetailDriver {
  id: number;
  name: string;
  phone: string;
  status: string;
  image: string | null;
  rate_per_order: number;
  is_active: boolean;
  average_rating: number;
  total_orders: number;
  completed_orders: number;
  total_earnings: number;
  created_at: string;
}

export interface OrderDetailItemVariantAttribute {
  type: string;
  value: string;
  attribute: string;
}

export interface OrderDetailItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  discount: number;
  status: OrderStatus;
  variant_attributes?:
    | Array<OrderDetailItemVariantAttribute>
    | Record<string, string | OrderDetailItemVariantAttribute>
    | null;
}

export interface OrderDetailData {
  id: number;
  order_code: string;
  status: OrderStatus;
  cart_type: string;
  is_instant_delivery: boolean;
  delivery_price: number;
  subtotal: number;
  total: number;
  total_with_delivery: number;
  total_quantity: number;
  basket_discount: number;
  coupon_discount: number | null;
  assigned_by: string;
  coupon_discount_from_points: string;
  free_delivery_from_points: number;
  used_coupon_exchange_id: number | null;
  used_free_delivery_exchange_id: number | null;
  created_at: string;
  affiliate: OrderDetailAffiliate | null;
  timestamps: OrderDetailTimestamps;
  user: OrderDetailUser;
  driver: OrderDetailDriver | null;
  user_address: any | null;
  baskes: any | null;
  basket_schedule: any | null;
  items: OrderDetailItem[];
}

export interface OrderDetailsResponse {
  status: boolean;
  message: string;
  data: OrderDetailData;
}

export interface ChangeOrderStatusPayload {
  status: OrderStatus;
}

export interface AssignDriverPayload {
  driver_id: number;
}

export interface ChangeItemStatusPayload {
  status: OrderStatus;
}
