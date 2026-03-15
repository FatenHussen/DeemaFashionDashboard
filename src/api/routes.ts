import { ROOTS } from 'src/routes/paths';

// ----------------------------------------------------------------------

export const apiRoutes = {
  // Auth routes
  auth: {
    me: '/api/auth/me',
    signIn: '/admin/auth/login',
    logout: '/admin/auth/logout',
    profile: '/admin/auth/profile',
    notifications: '/admin/auth/notifications',
    storeToken: '/admin/auth/store-token',
  },
  // Admin routes
  admin: {
    list: `${ROOTS.ADMIN}/admins`,
    create: `${ROOTS.ADMIN}/admins`,
    update: (id: number | string) => `${ROOTS.ADMIN}/admins/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/admins/${id}`,
  },
  // Vendor routes
  vendor: {
    list: `${ROOTS.ADMIN}/vendors`,
    create: `${ROOTS.ADMIN}/vendors`,
    update: (id: number | string) => `${ROOTS.ADMIN}/vendors/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/vendors/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/vendors/${id}`,
  },
  // Shop routes
  shop: {
    list: `${ROOTS.ADMIN}/shops`,
    create: `${ROOTS.ADMIN}/shops`,
    update: (id: number | string) => `${ROOTS.ADMIN}/shops/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/shops/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/shops/${id}`,
  },
  // Role routes
  role: {
    list: `${ROOTS.ADMIN}/roles`,
    create: `${ROOTS.ADMIN}/roles`,
    update: (id: number | string) => `${ROOTS.ADMIN}/roles/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/roles/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/roles/${id}`,
  },
  // Permission routes
  permission: {
    list: `${ROOTS.ADMIN}/permissions`,
  },
  // Driver routes
  driver: {
    list: `${ROOTS.ADMIN}/drivers`,
    create: `${ROOTS.ADMIN}/drivers`,
    update: (id: number | string) => `${ROOTS.ADMIN}/drivers/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/drivers/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/drivers/${id}`,
  },
  // Brand routes
  brand: {
    list: `${ROOTS.ADMIN}/brands`,
    create: `${ROOTS.ADMIN}/brands`,
    update: (id: number | string) => `${ROOTS.ADMIN}/brands/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/brands/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/brands/${id}`,
  },
  // Governorate routes
  governorate: {
    list: `${ROOTS.ADMIN}/governorates`,
    create: `${ROOTS.ADMIN}/governorates`,
    update: (id: number | string) => `${ROOTS.ADMIN}/governorates/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/governorates/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/governorates/${id}`,
  },
  // City routes
  city: {
    list: `${ROOTS.ADMIN}/cities`,
    create: `${ROOTS.ADMIN}/cities`,
    update: (id: number | string) => `${ROOTS.ADMIN}/cities/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/cities/${id}`,
  },
  // Area routes
  area: {
    list: `${ROOTS.ADMIN}/areas`,
    create: `${ROOTS.ADMIN}/areas`,
    update: (id: number | string) => `${ROOTS.ADMIN}/areas/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/areas/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/areas/${id}`,
  },
  // Category routes
  category: {
    list: `${ROOTS.ADMIN}/categories`,
    create: `${ROOTS.ADMIN}/categories`,
    update: (id: number | string) => `${ROOTS.ADMIN}/categories/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/categories/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/categories/${id}`,
  },
  // Category Attribute routes
  categoryAttribute: {
    list: `${ROOTS.ADMIN}/category-attributes`,
    create: `${ROOTS.ADMIN}/category-attributes`,
    update: (id: number | string) => `${ROOTS.ADMIN}/category-attributes/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/category-attributes/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/category-attributes/${id}`,
  },
  // Category Details routes
  categoryDetail: {
    list: `${ROOTS.ADMIN}/category-details`,
    create: `${ROOTS.ADMIN}/category-details`,
    update: (id: number | string) => `${ROOTS.ADMIN}/category-details/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/category-details/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/category-details/${id}`,
  },
  // Service routes
  service: {
    list: `${ROOTS.ADMIN}/services`,
    create: `${ROOTS.ADMIN}/services`,
    update: (id: number | string) => `${ROOTS.ADMIN}/services/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/services/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/services/${id}`,
  },
  // Language routes
  language: {
    list: `${ROOTS.ADMIN}/languages`,
    create: `${ROOTS.ADMIN}/languages`,
    update: (id: number | string) => `${ROOTS.ADMIN}/languages/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/languages/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/languages/${id}`,
  },
  // Section routes
  section: {
    list: `${ROOTS.ADMIN}/sections`,
    create: `${ROOTS.ADMIN}/sections`,
    update: (id: number | string) => `${ROOTS.ADMIN}/sections/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/sections/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/sections/${id}`,
    itemTypes: `${ROOTS.ADMIN}/sections/item-types`,
  },
  // Banner routes
  banner: {
    list: `${ROOTS.ADMIN}/banners`,
    create: `${ROOTS.ADMIN}/banners`,
    update: (id: number | string) => `${ROOTS.ADMIN}/banners/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/banners/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/banners/${id}`,
  },
  // Page Section routes
  pageSection: {
    list: `${ROOTS.ADMIN}/page-sections`,
    create: `${ROOTS.ADMIN}/page-sections`,
    update: (id: number | string) => `${ROOTS.ADMIN}/page-sections/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/page-sections/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/page-sections/${id}`,
    pages: `${ROOTS.ADMIN}/sections/pages`,
    displayTypes: `${ROOTS.ADMIN}/sections/display-types`,
  },
  // Other API routes (from old endpoints)
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  // Complaint routes
  complaint: {
    list: `${ROOTS.ADMIN}/complaints`,
    update: (id: number | string) => `${ROOTS.ADMIN}/complaints/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/complaints/${id}`,
  },
  // Coupon routes
  coupon: {
    list: `${ROOTS.ADMIN}/coupons`,
    create: `${ROOTS.ADMIN}/coupons`,
    update: (id: number | string) => `${ROOTS.ADMIN}/coupons/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/coupons/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/coupons/${id}`,
  },
  // User routes
  user: {
    list: `${ROOTS.ADMIN}/users`,
    create: `${ROOTS.ADMIN}/users`,
    update: (id: number | string) => `${ROOTS.ADMIN}/users/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/users/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/users/${id}`,
  },
  product: {
    list: `${ROOTS.ADMIN}/products`,
    create: `${ROOTS.ADMIN}/products`,
    update: (id: number | string) => `${ROOTS.ADMIN}/products/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/products/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/products/${id}`,
  },
  // Order routes
  order: {
    list: `${ROOTS.ADMIN}/orders`,
    details: (id: number | string) => `${ROOTS.ADMIN}/orders/${id}`,
    getOne: (id: number | string) => `${ROOTS.ADMIN}/orders/${id}/get_one`,
    changeStatus: (id: number | string) => `${ROOTS.ADMIN}/orders/${id}/change-status`,
    assignDriver: (id: number | string) => `${ROOTS.ADMIN}/orders/${id}/assign-driver`,
    changeItemStatus: (itemId: number | string) =>
      `${ROOTS.ADMIN}/orders/items/${itemId}/change-status`,
  },
  // Basket routes
  basket: {
    list: `${ROOTS.ADMIN}/baskets`,
    create: `${ROOTS.ADMIN}/baskets`,
    update: (id: number | string) => `${ROOTS.ADMIN}/baskets/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/baskets/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/baskets/${id}`,
  },
  // Scheduled Basket routes
  scheduledBasket: {
    list: `${ROOTS.ADMIN}/scheduled-baskets`,
    create: `${ROOTS.ADMIN}/scheduled-baskets`,
    update: (id: number | string) => `${ROOTS.ADMIN}/scheduled-baskets/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/scheduled-baskets/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/scheduled-baskets/${id}`,
  },
  // Package routes
  package: {
    list: `${ROOTS.ADMIN}/packages`,
    create: `${ROOTS.ADMIN}/packages`,
    update: (id: number | string) => `${ROOTS.ADMIN}/packages/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/packages/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/packages/${id}`,
  },
  // Subscription routes
  subscription: {
    list: `${ROOTS.ADMIN}/subscriptions`,
    create: `${ROOTS.ADMIN}/subscriptions`,
    update: (id: number | string) => `${ROOTS.ADMIN}/subscriptions/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/subscriptions/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/subscriptions/${id}`,
  },
  // Gift routes
  gift: {
    list: `${ROOTS.ADMIN}/gifts`,
    create: `${ROOTS.ADMIN}/gifts`,
    update: (id: number | string) => `${ROOTS.ADMIN}/gifts/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/gifts/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/gifts/${id}`,
  },
  // User Gift routes (هدايا المستخدمين)
  userGift: {
    list: `${ROOTS.ADMIN}/user-gifts`,
    create: `${ROOTS.ADMIN}/user-gifts`,
    update: (id: number | string) => `${ROOTS.ADMIN}/user-gifts/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/user-gifts/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/user-gifts/${id}`,
  },
  // Point Exchange routes
  pointExchange: {
    list: `${ROOTS.ADMIN}/point-exchanges`,
    details: (id: number | string) => `${ROOTS.ADMIN}/point-exchanges/${id}`,
    updateStatus: (id: number | string) => `${ROOTS.ADMIN}/point-exchanges/${id}`,
  },
  // User Points routes
  userPoints: {
    list: `${ROOTS.ADMIN}/user-points`,
    details: (userId: number | string) => `${ROOTS.ADMIN}/user-points/${userId}`,
    transactions: (userId: number | string) => `${ROOTS.ADMIN}/user-points/${userId}/transactions`,
    add: (userId: number | string) => `${ROOTS.ADMIN}/user-points/${userId}/add`,
    deduct: (userId: number | string) => `${ROOTS.ADMIN}/user-points/${userId}/deduct`,
    statistics: `${ROOTS.ADMIN}/user-points/statistics`,
  },
  // Currency routes
  currency: {
    list: `${ROOTS.ADMIN}/currencies`,
    create: `${ROOTS.ADMIN}/currencies`,
    update: (id: number | string) => `${ROOTS.ADMIN}/currencies/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/currencies/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/currencies/${id}`,
    toggleStatus: (id: number | string) => `${ROOTS.ADMIN}/currencies/${id}/toggle-status`,
  },
  // Recipe routes
  recipe: {
    list: `${ROOTS.ADMIN}/recipes`,
    create: `${ROOTS.ADMIN}/recipes`,
    update: (id: number | string) => `${ROOTS.ADMIN}/recipes/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/recipes/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/recipes/${id}`,
  },
  // Shop Product Variant routes (shared - used in selects)
  shopProductVariant: {
    list: `${ROOTS.ADMIN}/shop-product-variants`,
  },
  // Legal Document routes
  legalDocument: {
    list: `${ROOTS.ADMIN}/legal-documents`,
    details: (id: number | string) => `${ROOTS.ADMIN}/legal-documents/${id}`,
    update: (id: number | string) => `${ROOTS.ADMIN}/legal-documents/${id}`,
  },
  // FAQ routes
  faq: {
    list: `${ROOTS.ADMIN}/faqs`,
    create: `${ROOTS.ADMIN}/faqs`,
    details: (id: number | string) => `${ROOTS.ADMIN}/faqs/${id}`,
    update: (id: number | string) => `${ROOTS.ADMIN}/faqs/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/faqs/${id}`,
  },
  // Vendor Subscription routes
  vendorSubscription: {
    list: `${ROOTS.ADMIN}/vendor-subscriptions`,
    details: (id: number | string) => `${ROOTS.ADMIN}/vendor-subscriptions/${id}`,
  },
  // Admin Notifications (broadcast push notifications)
  adminNotification: {
    list: `${ROOTS.ADMIN}/notifications`,
    create: `${ROOTS.ADMIN}/notifications`,
  },
  // Vendor Packages
  vendorPackage: {
    list: `${ROOTS.ADMIN}/vendor-packages`,
    create: `${ROOTS.ADMIN}/vendor-packages`,
    update: (id: number | string) => `${ROOTS.ADMIN}/vendor-packages/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/vendor-packages/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/vendor-packages/${id}`,
  },
  // Seller Registration routes
  sellerRegistration: {
    list: `${ROOTS.ADMIN}/seller-registrations`,
    details: (id: number | string) => `${ROOTS.ADMIN}/seller-registrations/${id}`,
    approve: (id: number | string) => `${ROOTS.ADMIN}/seller-registrations/${id}/approve`,
    reject: (id: number | string) => `${ROOTS.ADMIN}/seller-registrations/${id}/reject`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/seller-registrations/${id}`,
  },
  // Vendor User routes
  vendorUser: {
    list: `${ROOTS.ADMIN}/vendor-users`,
    create: `${ROOTS.ADMIN}/vendor-users`,
    update: (id: number | string) => `${ROOTS.ADMIN}/vendor-users/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/vendor-users/${id}`,
    details: (id: number | string) => `${ROOTS.ADMIN}/vendor-users/${id}`,
  },
  // Reports routes
  reports: {
    sales: `${ROOTS.ADMIN}/reports/sales`,
    salesExport: `${ROOTS.ADMIN}/reports/export/sales`,
    productMovement: `${ROOTS.ADMIN}/reports/product-movement`,
    productMovementExport: `${ROOTS.ADMIN}/reports/export/product-movement`,
    vendorPerformance: (id: number | string) => `${ROOTS.ADMIN}/reports/vendor-performance/${id}`,
    vendorPerformanceExport: (id: number | string) =>
      `${ROOTS.ADMIN}/reports/vendor-performance/${id}/export`,
    driverPerformance: (id: number | string) => `${ROOTS.ADMIN}/reports/driver-performance/${id}`,
    driverPerformanceExport: (id: number | string) =>
      `${ROOTS.ADMIN}/reports/driver-performance/${id}/export`,
    salesByLocation: `${ROOTS.ADMIN}/reports/sales-by-location`,
    salesByLocationExport: `${ROOTS.ADMIN}/reports/export/sales-by-location`,
    salesByCategory: `${ROOTS.ADMIN}/reports/sales-by-category`,
    salesByCategoryExport: `${ROOTS.ADMIN}/reports/export/sales-by-category`,
  },
  // Statistics routes
  statistics: {
    dashboard: `${ROOTS.ADMIN}/statistics/dashboard`,
    counts: `${ROOTS.ADMIN}/statistics/counts`,
    monthlyPerformance: `${ROOTS.ADMIN}/statistics/monthly-performance`,
    ordersByStatus: `${ROOTS.ADMIN}/statistics/orders-by-status`,
    topShops: `${ROOTS.ADMIN}/statistics/top-shops`,
    revenueTrend: `${ROOTS.ADMIN}/statistics/revenue-trend`,
    ordersByHour: `${ROOTS.ADMIN}/statistics/orders-by-hour`,
    ordersByDay: `${ROOTS.ADMIN}/statistics/orders-by-day`,
    topCategories: `${ROOTS.ADMIN}/statistics/top-categories`,
    userGrowth: `${ROOTS.ADMIN}/statistics/user-growth`,
    orderFunnel: `${ROOTS.ADMIN}/statistics/order-funnel`,
    avgOrderValueTrend: `${ROOTS.ADMIN}/statistics/avg-order-value-trend`,
    driverComparison: `${ROOTS.ADMIN}/statistics/driver-comparison`,
    stockLevels: `${ROOTS.ADMIN}/statistics/stock-levels`,
    salesHeatmap: `${ROOTS.ADMIN}/statistics/sales-heatmap`,
  },
} as const;
