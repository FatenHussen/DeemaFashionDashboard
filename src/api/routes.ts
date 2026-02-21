import { ROOTS } from 'src/routes/paths';

// ----------------------------------------------------------------------

export const apiRoutes = {
  // Auth routes
  auth: {
    me: '/api/auth/me',
    signIn: '/admin/auth/login',
    logout: '/admin/auth/logout',
    profile: '/admin/auth/profile',
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
  },
  // Shop routes
  shop: {
    list: `${ROOTS.ADMIN}/shops`,
    create: `${ROOTS.ADMIN}/shops`,
    update: (id: number | string) => `${ROOTS.ADMIN}/shops/${id}`,
    delete: (id: number | string) => `${ROOTS.ADMIN}/shops/${id}`,
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
} as const;
