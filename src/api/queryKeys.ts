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
  },
  // Role query keys
  role: {
    list: (params?: { page?: number; limit?: number }) => ['role', 'list', params] as const,
    details: (id: number | string) => ['role', 'details', id] as const,
  },
  // Permission query keys
  permission: {
    list: (params?: { page?: number; limit?: number }) => ['permission', 'list', params] as const,
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
    list: (params?: { page?: number; limit?: number }) =>
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
  // Page Section query keys
  pageSection: {
    list: (params?: { page?: number; limit?: number }) => ['pageSection', 'list', params] as const,
    details: (id: number | string) => ['pageSection', 'details', id] as const,
    pages: () => ['pageSection', 'pages'] as const,
    displayTypes: () => ['pageSection', 'display-types'] as const,
  },
} as const;
