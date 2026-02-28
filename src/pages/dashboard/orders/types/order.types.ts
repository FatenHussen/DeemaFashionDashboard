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

export interface OrderDetailsResponse {
  status: boolean;
  message: string;
  data: OrderData;
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
