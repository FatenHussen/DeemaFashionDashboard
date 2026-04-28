// ----------------------------------------------------------------------
// Report API response types (from REPORTS_API_DOCUMENTATION)
// ----------------------------------------------------------------------

export interface SalesReportOrder {
  order_code: string;
  user: string;
  total: number;
  delivery_price: number;
  delivered_at: string;
}

export interface SalesReportData {
  total_orders: number;
  total_revenue: number;
  total_delivery_fees: number;
  total_discounts: number;
  average_order_value: number;
  total_cost?: number;
  total_expenses?: number;
  net_profit?: number;
  orders: SalesReportOrder[];
}

export interface SalesReportResponse {
  status: boolean;
  message?: string;
  data: SalesReportData;
}

export interface ProductMovementItem {
  product_id?: number;
  id?: number;
  product_name?: { ar: string; en: string } | string;
  name?: { ar: string; en: string } | string;
  total_sold?: number | string;
  total_revenue?: number | string;
  sku?: string;
  category?: { ar: string; en: string } | string;
}

export interface ProductMovementData {
  top_selling: ProductMovementItem[];
  least_selling: ProductMovementItem[];
  inactive_products: ProductMovementItem[];
}

export interface ProductMovementReportResponse {
  status: boolean;
  message?: string;
  data: ProductMovementData;
}

export interface VendorPerformanceData {
  vendor_id: number;
  vendor_name: { ar: string; en: string };
  total_sales: number;
  total_orders: number;
  average_order_value: number;
  total_shops: number;
  active_shops: number;
  average_rating: number;
  total_ratings: number;
  customer_satisfaction: number;
}

export interface VendorPerformanceReportResponse {
  status: boolean;
  message?: string;
  data: VendorPerformanceData;
}

export interface DriverPerformanceData {
  driver_id: number;
  driver_name: { ar: string; en: string };
  total_orders: number;
  total_earnings: number;
  average_delivery_time_minutes: number;
  average_rating: number;
  total_ratings: number;
  total_complaints: number;
}

export interface DriverPerformanceReportResponse {
  status: boolean;
  message?: string;
  data: DriverPerformanceData;
}

export interface SalesByLocationItem {
  governorate?: string | { ar: string; en: string };
  city?: string | { ar: string; en: string };
  total_orders: number;
  total_revenue: number;
}

export interface SalesByLocationData {
  by_governorate: SalesByLocationItem[];
  by_city: SalesByLocationItem[];
}

export interface SalesByLocationReportResponse {
  status: boolean;
  message?: string;
  data: SalesByLocationData;
}

export interface SalesByCategoryItem {
  category: string | { ar: string; en: string };
  total_quantity: number;
  total_revenue: number;
}

export interface SalesByCategoryData {
  by_category: SalesByCategoryItem[];
}

export interface SalesByCategoryReportResponse {
  status: boolean;
  message?: string;
  data: SalesByCategoryData;
}

// Common report filter params
export interface ReportDateParams {
  from_date?: string;
  to_date?: string;
}

export interface SalesReportParams extends ReportDateParams {
  governorate_id?: number;
  city_id?: number;
  vendor_id?: number;
  shop_id?: number;
  payment_method?: string;
}

export interface ProductMovementReportParams extends ReportDateParams {
  category_id?: number;
}
