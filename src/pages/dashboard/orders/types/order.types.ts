// ----------------------------------------------------------------------

export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'out_delivery'
  | 'delivered'
  | 'cancelled';

/** All statuses selectable when updating an order (admin). */
export const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'preparing',
  'out_delivery',
  'delivered',
  'cancelled',
];

/** Forward fulfillment flow only (no going back to a previous step). */
export const ORDER_STATUS_PIPELINE: OrderStatus[] = [
  'pending',
  'preparing',
  'out_delivery',
  'delivered',
];

/** Statuses strictly after the current step in the pipeline (skip allowed). */
export function getUpcomingOrderStatuses(current: OrderStatus): OrderStatus[] {
  const idx = ORDER_STATUS_PIPELINE.indexOf(current);
  if (idx === -1) return [];
  return ORDER_STATUS_PIPELINE.slice(idx + 1);
}

/**
 * Map API / inconsistent strings to a canonical status so comparisons and
 * `<select value={…}>` work (e.g. going back from delivered → preparing).
 */
export function normalizeOrderStatus(raw: string | number | undefined | null): OrderStatus {
  if (raw == null || raw === '') return 'pending';
  const s = String(raw).trim().toLowerCase().replace(/[\s-]+/g, '_');
  const aliases: Record<string, OrderStatus> = {
    pending: 'pending',
    preparing: 'preparing',
    out_delivery: 'out_delivery',
    out_for_delivery: 'out_delivery',
    outfordelivery: 'out_delivery',
    delivered: 'delivered',
    cancelled: 'cancelled',
    canceled: 'cancelled',
  };
  if (aliases[s]) return aliases[s];
  if ((ORDER_STATUS_OPTIONS as readonly string[]).includes(s)) return s as OrderStatus;
  return 'pending';
}

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
  name?: string;
  phone: string;
  address?: string;
  status?: string;
  is_active?: number | boolean;
  rate_per_order?: string | number;
}

export interface OrderPaymentMethod {
  id: number;
  name: string;
  /** Relative path or absolute URL (e.g. payments/image3.png) */
  icon?: string | null;
}

export interface OrderData {
  id: number;
  /** Human-readable reference from API (e.g. ORD-260325-00022) */
  order_code?: string;
  /** @deprecated Some responses used this name; prefer `order_code` */
  order_number?: string;
  status: OrderStatus;
  total: number;
  /** Sum of line items before delivery (often after basket/coupon discounts) */
  subtotal?: number;
  delivery_price?: number;
  /** Legacy combined discount; list API may use `basket_discount` / `coupon_discount` instead */
  discount?: number;
  /** List API: basket line discount total */
  basket_discount?: number;
  coupon_discount?: number | null;
  subscription_discount?: string | number;
  price_after_discount?: number;
  rating?: number;
  user: OrderUser;
  driver?: OrderDriver;
  payment_method?: OrderPaymentMethod | null;
  items?: OrderItem[];
  address?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
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
  affiliate_commission_type?: string;
  affiliate_fixed_commission?: number | string;
  affiliate_commission_amount?: number;
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

/** Dropdown option from `GET /orders/to-assign`. */
export interface OrderToAssignOption {
  id: number;
  value: string;
}

export interface OrdersToAssignResponse {
  status: boolean;
  message: string;
  data: OrderToAssignOption[];
}

export interface OrderDetailsResponse {
  status: boolean;
  message: string;
  data: OrderDetailData;
}

export interface ChangeOrderStatusPayload {
  status: OrderStatus;
  /** Required when setting status to `cancelled` (admin rejection). */
  rejection_reason?: string;
}

export interface AssignDriverPayload {
  driver_id: number;
}

export interface ChangeItemStatusPayload {
  status: OrderStatus;
}
