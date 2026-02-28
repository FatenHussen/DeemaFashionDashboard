// ----------------------------------------------------------------------
// Statistics API response types (from STATISTICS_CHARTS_API_DOCUMENTATION)
// ----------------------------------------------------------------------

export interface StatCounts {
  total_users: number;
  active_users: number;
  total_drivers: number;
  active_drivers: number;
  total_products: number;
  active_products: number;
  total_shops: number;
  active_shops: number;
  total_vendors: number;
  total_orders: number;
  completed_orders: number;
}

export interface MonthlyPerformanceItem {
  completed_orders: number;
  total_revenue: number;
}

export interface OrdersByStatus {
  pending: number;
  preparing: number;
  out_for_delivery: number;
  delivered: number;
  cancelled: number;
}

export interface TopShop {
  id: number;
  name: { ar: string; en: string };
  total_orders: number;
  average_rating: number;
  is_active: boolean;
}

export interface DashboardStatisticsData {
  counts: StatCounts;
  monthly_performance: Record<string, MonthlyPerformanceItem>;
  orders_by_status: OrdersByStatus;
  active_deliveries: number;
  top_shops: TopShop[];
  year: number;
}

export interface DashboardStatisticsResponse {
  status: boolean;
  message?: string;
  data: DashboardStatisticsData;
}

export interface CountsResponse {
  status: boolean;
  data: StatCounts;
}

export interface MonthlyPerformanceResponse {
  status: boolean;
  data: {
    year: number;
    monthly_performance: Record<string, MonthlyPerformanceItem>;
  };
}

export interface OrdersByStatusResponse {
  status: boolean;
  data: OrdersByStatus;
}

export interface TopShopsResponse {
  status: boolean;
  data: TopShop[];
}

// Revenue Trend
export interface RevenueTrendPoint {
  date: string;
  day_name: string;
  orders: number;
  revenue: number;
}

export interface RevenueTrendResponse {
  status: boolean;
  data: {
    chart_type: string;
    title: string;
    data: RevenueTrendPoint[];
  };
}

// Orders by Hour
export interface OrdersByHourPoint {
  hour: string;
  count: number;
}

export interface OrdersByHourResponse {
  status: boolean;
  data: {
    chart_type: string;
    title: string;
    data: OrdersByHourPoint[];
  };
}

// Orders by Day
export interface OrdersByDayPoint {
  day: string;
  count: number;
}

export interface OrdersByDayResponse {
  status: boolean;
  data: {
    chart_type: string;
    title: string;
    data: OrdersByDayPoint[];
  };
}

// Top Categories
export interface TopCategoryPoint {
  category_id: number;
  category_name: { ar: string; en: string };
  revenue: number;
}

export interface TopCategoriesResponse {
  status: boolean;
  data: {
    chart_type: string;
    title: string;
    data: TopCategoryPoint[];
  };
}

// User Growth
export interface UserGrowthPoint {
  month: string;
  new_users: number;
  total_users: number;
}

export interface UserGrowthResponse {
  status: boolean;
  data: {
    chart_type: string;
    title: string;
    data: UserGrowthPoint[];
  };
}

// Order Funnel
export interface OrderFunnelPoint {
  stage: string;
  count: number;
}

export interface OrderFunnelResponse {
  status: boolean;
  data: {
    chart_type: string;
    title: string;
    data: OrderFunnelPoint[];
  };
}

// Avg Order Value Trend
export interface AvgOrderValuePoint {
  month: string;
  average_order_value: number;
}

export interface AvgOrderValueTrendResponse {
  status: boolean;
  data: {
    chart_type: string;
    title: string;
    data: AvgOrderValuePoint[];
  };
}

// Driver Comparison
export interface DriverComparisonPoint {
  driver_name: string;
  total_orders: number;
  average_rating: number;
  avg_delivery_time: number;
}

export interface DriverComparisonResponse {
  status: boolean;
  data: {
    chart_type: string;
    title: string;
    data: DriverComparisonPoint[];
  };
}

// Stock Levels (Gauge)
export interface StockLevelPoint {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export interface StockLevelsResponse {
  status: boolean;
  data: {
    chart_type: string;
    title: string;
    data: StockLevelPoint[];
  };
}

// Sales Heatmap
export interface SalesHeatmapPoint {
  day: string;
  hour: string;
  value: number;
}

export interface SalesHeatmapResponse {
  status: boolean;
  data: {
    chart_type: string;
    title: string;
    data: SalesHeatmapPoint[];
  };
}
