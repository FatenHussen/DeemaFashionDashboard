// ----------------------------------------------------------------------

export const queryKeys = {
  // Column order
  columnOrder: () => ['column_order'] as const,
  // Admin query keys
  admin: {
    list: (params?: { page?: number; limit?: number }) => ['admin', 'list', params] as const,
    details: (id: number | string) => ['admin', 'details', id] as const,
  },
  // Vendor query keys
  vendor: {
    list: (params?: { page?: number; limit?: number }) => ['vendor', 'list', params] as const,
    details: (id: number | string) => ['vendor', 'details', id] as const,
  },
  // Shop query keys
  shop: {
    list: (params?: { page?: number; limit?: number }) => ['shop', 'list', params] as const,
    details: (id: number | string) => ['shop', 'details', id] as const,
  },
  // Auth query keys
  auth: {
    profile: () => ['auth', 'profile'] as const,
    notifications: () => ['auth', 'notifications'] as const,
  },
  // Role query keys
  role: {
    list: (params?: { page?: number; limit?: number }) => ['role', 'list', params] as const,
    details: (id: number | string) => ['role', 'details', id] as const,
  },
  // Permission query keys
  permission: {
    list: (params?: { page?: number; limit?: number; per_page?: number }) =>
      ['permission', 'list', params] as const,
  },
  // Driver query keys
  driver: {
    list: (params?: { page?: number; limit?: number }) => ['driver', 'list', params] as const,
    details: (id: number | string) => ['driver', 'details', id] as const,
  },
  // Brand query keys
  brand: {
    list: (params?: { name?: string }) => ['brand', 'list', params] as const,
    details: (id: number | string) => ['brand', 'details', id] as const,
  },
  // Product query keys
  product: {
    list: (params?: { page?: number; limit?: number }) => ['product', 'list', params] as const,
    details: (id: number | string) => ['product', 'details', id] as const,
  },
  // Governorate query keys
  governorate: {
    list: (params?: { page?: number; limit?: number }) => ['governorate', 'list', params] as const,
    details: (id: number | string) => ['governorate', 'details', id] as const,
  },
  // City query keys
  city: {
    list: (params?: { page?: number; limit?: number }) => ['city', 'list', params] as const,
    details: (id: number | string) => ['city', 'details', id] as const,
  },
  // Area query keys
  area: {
    list: (params?: { page?: number; limit?: number }) => ['area', 'list', params] as const,
    details: (id: number | string) => ['area', 'details', id] as const,
  },
  // Category query keys
  category: {
    list: (params?: { page?: number; limit?: number; parent_id?: number }) =>
      ['category', 'list', params] as const,
    details: (id: number | string) => ['category', 'details', id] as const,
  },
  // Category Attribute query keys
  categoryAttribute: {
    list: (params?: { categoryId?: number | string; page?: number; limit?: number }) =>
      ['categoryattribute', 'list', params] as const,
    details: (id: number | string) => ['categoryattribute', 'details', id] as const,
  },
  // Category Detail query keys
  categoryDetail: {
    list: (params?: { page?: number; limit?: number }) =>
      ['categorydetail', 'list', params] as const,
    details: (id: number | string) => ['categorydetail', 'details', id] as const,
  },
  // Service query keys
  service: {
    list: (params?: { page?: number; limit?: number }) => ['service', 'list', params] as const,
    details: (id: number | string) => ['service', 'details', id] as const,
  },
  // Language query keys
  language: {
    list: (params?: { page?: number; limit?: number; code?: string; is_active?: number; direction?: string }) => ['language', 'list', params] as const,
    details: (id: number | string) => ['language', 'details', id] as const,
  },
  // Section query keys
  section: {
    list: (params?: { page?: number; limit?: number }) => ['section', 'list', params] as const,
    details: (id: number | string) => ['section', 'details', id] as const,
    itemTypes: () => ['section', 'item-types'] as const,
    manualItems: (manualModel: string, url: string, params?: { page?: number; limit?: number; search?: string }) =>
      ['section', 'manual-items', manualModel, url, params] as const,
  },
  // User query keys
  user: {
    list: (params?: {
      page?: number;
      per_page?: number;
      is_affiliate?: number;
      affiliate_approved?: number;
      area_id?: number;
    }) => ['user', 'list', params] as const,
    details: (id: number | string) => ['user', 'details', id] as const,
  },
  // Complaint query keys
  complaint: {
    list: (params?: { page?: number; per_page?: number; status?: string; user_id?: number }) =>
      ['complaint', 'list', params] as const,
    details: (id: number | string) => ['complaint', 'details', id] as const,
  },
  // Coupon query keys
  coupon: {
    list: (params?: { page?: number; per_page?: number }) => ['coupon', 'list', params] as const,
    details: (id: number | string) => ['coupon', 'details', id] as const,
  },
  // Banner query keys
  banner: {
    list: (params?: { page?: number; per_page?: number }) => ['banner', 'list', params] as const,
    details: (id: number | string) => ['banner', 'details', id] as const,
  },
  // Page Section query keys
  pageSection: {
    list: (params?: { page?: number; limit?: number }) => ['pageSection', 'list', params] as const,
    details: (id: number | string) => ['pageSection', 'details', id] as const,
    pages: () => ['pageSection', 'pages'] as const,
    displayTypes: () => ['pageSection', 'display-types'] as const,
  },
  // Order query keys
  order: {
    list: (params?: { page?: number; per_page?: number; status?: string }) => ['order', 'list', params] as const,
    details: (id: number | string) => ['order', 'details', id] as const,
  },
  // Basket query keys
  basket: {
    list: (params?: { page?: number; per_page?: number }) => ['basket', 'list', params] as const,
    details: (id: number | string) => ['basket', 'details', id] as const,
  },
  // Scheduled Basket query keys
  scheduledBasket: {
    list: (params?: {
      page?: number;
      per_page?: number;
      search?: string;
      category_id?: number;
      sort_field?: string;
      sort_order?: string;
    }) => ['scheduledBasket', 'list', params] as const,
    details: (id: number | string) => ['scheduledBasket', 'details', id] as const,
  },
  // Package query keys
  package: {
    list: (params?: { page?: number; per_page?: number }) => ['package', 'list', params] as const,
    details: (id: number | string) => ['package', 'details', id] as const,
  },
  // Subscription query keys (GET /admin/subscriptions — list + show only)
  subscription: {
    list: (params?: {
      page?: number;
      per_page?: number;
      user_id?: number;
      package_id?: number;
      status?: string;
      start_date_from?: string;
      start_date_to?: string;
      search?: string;
      sortField?: string;
      sortOrder?: 'asc' | 'desc';
    }) => ['subscription', 'list', params] as const,
    details: (id: number | string) => ['subscription', 'details', id] as const,
  },
  // Gift query keys
  gift: {
    list: (params?: { page?: number; per_page?: number }) => ['gift', 'list', params] as const,
    details: (id: number | string) => ['gift', 'details', id] as const,
  },
  // User Gift query keys
  userGift: {
    list: (params?: Record<string, unknown>) => ['userGift', 'list', params] as const,
    details: (id: number | string) => ['userGift', 'details', id] as const,
  },
  // Point Exchange query keys
  pointExchange: {
    list: (params?: { page?: number; per_page?: number }) => ['pointExchange', 'list', params] as const,
    details: (id: number | string) => ['pointExchange', 'details', id] as const,
  },
  // User Points query keys
  userPoints: {
    list: (params?: { page?: number; per_page?: number }) => ['userPoints', 'list', params] as const,
    details: (userId: number | string) => ['userPoints', 'details', userId] as const,
    transactions: (userId: number | string, params?: { page?: number; per_page?: number }) =>
      ['userPoints', 'transactions', userId, params] as const,
    statistics: () => ['userPoints', 'statistics'] as const,
  },
  // Currency query keys
  currency: {
    list: (params?: { page?: number; per_page?: number }) => ['currency', 'list', params] as const,
    details: (id: number | string) => ['currency', 'details', id] as const,
  },
  // Recipe query keys
  recipe: {
    list: (params?: { page?: number; per_page?: number }) => ['recipe', 'list', params] as const,
    details: (id: number | string) => ['recipe', 'details', id] as const,
  },
  // Shop Product Variant query keys (shared - used in selects)
  shopProductVariant: {
    list: (params?: { page?: number; per_page?: number }) =>
      ['shopProductVariant', 'list', params] as const,
  },
  // Legal Document query keys
  legalDocument: {
    list: (params?: { page?: number; per_page?: number }) =>
      ['legalDocument', 'list', params] as const,
    details: (id: number | string) => ['legalDocument', 'details', id] as const,
  },
  // FAQ query keys
  faq: {
    list: (params?: { page?: number; per_page?: number; type?: string }) =>
      ['faq', 'list', params] as const,
    details: (id: number | string) => ['faq', 'details', id] as const,
  },
  // Vendor Subscription query keys
  vendorSubscription: {
    list: (params?: Record<string, any>) => ['vendorSubscription', 'list', params] as const,
    details: (id: number | string) => ['vendorSubscription', 'details', id] as const,
  },
  // Admin Notification query keys
  adminNotification: {
    list: (params?: { page?: number; per_page?: number; search?: string }) =>
      ['adminNotification', 'list', params] as const,
  },
  // Vendor Package query keys
  vendorPackage: {
    list: (params?: {
      page?: number;
      per_page?: number;
      sort_field?: string;
      sort_order?: string;
      is_active?: number;
      min_price?: number;
      max_price?: number;
      slug?: string;
      search?: string;
    }) => ['vendorPackage', 'list', params] as const,
    details: (id: number | string) => ['vendorPackage', 'details', id] as const,
  },
  // Vendor User query keys
  vendorUser: {
    list: (params?: { page?: number; per_page?: number; search?: string }) =>
      ['vendorUser', 'list', params] as const,
    details: (id: number | string) => ['vendorUser', 'details', id] as const,
  },
  // Seller Registration query keys
  sellerRegistration: {
    list: (params?: { page?: number; per_page?: number }) =>
      ['sellerRegistration', 'list', params] as const,
    details: (id: number | string) => ['sellerRegistration', 'details', id] as const,
  },
  // Setting query keys
  setting: {
    list: (params?: { page?: number; per_page?: number }) => ['setting', 'list', params] as const,
    details: (key: string) => ['setting', 'details', key] as const,
  },
  // Badge query keys
  badge: {
    list: (params?: { page?: number; per_page?: number }) => ['badge', 'list', params] as const,
    details: (id: number | string) => ['badge', 'details', id] as const,
  },
  // Activity Log query keys
  activityLog: {
    list: (params?: { page?: number; per_page?: number; action?: string; model?: string }) =>
      ['activityLog', 'list', params] as const,
  },
  // Affiliate Withdraw Request query keys
  affiliateWithdraw: {
    list: (params?: Record<string, any>) => ['affiliateWithdraw', 'list', params] as const,
    details: (id: number | string) => ['affiliateWithdraw', 'details', id] as const,
  },
  // Icon query keys
  icon: {
    list: (params?: { page?: number; per_page?: number }) => ['icon', 'list', params] as const,
    details: (id: number | string) => ['icon', 'details', id] as const,
  },
  // Promotion query keys
  promotion: {
    list: (params?: { page?: number; per_page?: number }) => ['promotion', 'list', params] as const,
    details: (id: number | string) => ['promotion', 'details', id] as const,
  },
  // Country query keys
  country: {
    list: (params?: { page?: number; per_page?: number }) => ['country', 'list', params] as const,
    details: (id: number | string) => ['country', 'details', id] as const,
  },
  // Promotion Request query keys
  promotionRequest: {
    list: (params?: { page?: number; per_page?: number; status?: string }) =>
      ['promotionRequest', 'list', params] as const,
    details: (id: number | string) => ['promotionRequest', 'details', id] as const,
  },
  // Point Rule query keys
  pointRule: {
    list: (params?: { page?: number; per_page?: number }) => ['pointRule', 'list', params] as const,
    details: (id: number | string) => ['pointRule', 'details', id] as const,
  },
  // Schedule query keys
  schedule: {
    list: (params?: { page?: number; per_page?: number }) => ['schedule', 'list', params] as const,
    details: (id: number | string) => ['schedule', 'details', id] as const,
  },
  // User Basket Schedule query keys
  userBasketSchedule: {
    list: (params?: { page?: number; per_page?: number }) =>
      ['userBasketSchedule', 'list', params] as const,
    details: (id: number | string) => ['userBasketSchedule', 'details', id] as const,
  },
  // Report query keys
  report: {
    sales: (params?: object) => ['report', 'sales', params] as const,
    productMovement: (params?: object) => ['report', 'productMovement', params] as const,
    vendorPerformance: (id: number | string, params?: object) =>
      ['report', 'vendorPerformance', id, params] as const,
    driverPerformance: (id: number | string, params?: object) =>
      ['report', 'driverPerformance', id, params] as const,
    salesByLocation: (params?: object) => ['report', 'salesByLocation', params] as const,
    salesByCategory: (params?: object) => ['report', 'salesByCategory', params] as const,
  },
  // Statistics query keys
  statistics: {
    dashboard: (params?: Record<string, unknown>) => ['statistics', 'dashboard', params] as const,
    counts: (params?: Record<string, unknown>) => ['statistics', 'counts', params] as const,
    monthlyPerformance: (params?: Record<string, unknown>) =>
      ['statistics', 'monthlyPerformance', params] as const,
    ordersByStatus: (params?: Record<string, unknown>) => ['statistics', 'ordersByStatus', params] as const,
    topShops: (params?: Record<string, unknown>) => ['statistics', 'topShops', params] as const,
    revenueTrend: (params?: Record<string, unknown>) =>
      ['statistics', 'revenueTrend', params] as const,
    ordersByHour: (params?: Record<string, unknown>) => ['statistics', 'ordersByHour', params] as const,
    ordersByDay: (params?: Record<string, unknown>) => ['statistics', 'ordersByDay', params] as const,
    topCategories: (params?: Record<string, unknown>) =>
      ['statistics', 'topCategories', params] as const,
    userGrowth: (params?: Record<string, unknown>) => ['statistics', 'userGrowth', params] as const,
    orderFunnel: (params?: Record<string, unknown>) => ['statistics', 'orderFunnel', params] as const,
    avgOrderValueTrend: (params?: Record<string, unknown>) =>
      ['statistics', 'avgOrderValueTrend', params] as const,
    driverComparison: (params?: Record<string, unknown>) =>
      ['statistics', 'driverComparison', params] as const,
    stockLevels: (params?: Record<string, unknown>) => ['statistics', 'stockLevels', params] as const,
    salesHeatmap: (params?: Record<string, unknown>) => ['statistics', 'salesHeatmap', params] as const,
  },
} as const;
