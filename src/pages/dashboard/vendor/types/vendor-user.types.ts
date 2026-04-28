export interface VendorUserShop {
  id: number;
  name: string | { ar: string; en: string };
  email: string;
  is_active: boolean;
}

export interface VendorUserVendor {
  id: number;
  name: string | { ar: string; en: string };
}

export interface VendorUserItem {
  id: number;
  name: string;
  email: string;
  is_active: boolean | number;
  vendor_id: number;
  vendor_name?: string | { ar: string; en: string };
  vendor?: VendorUserVendor;
  shops_count?: number;
  shops?: VendorUserShop[];
  created_at: string;
  updated_at: string;
}

export interface VendorUserListResponse {
  status: boolean;
  message: string;
  data: {
    items: VendorUserItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface VendorUserCreatePayload {
  name: string;
  email: string;
  password: string;
  vendor_id: number;
  is_active?: boolean;
  shop_ids?: number[];
}

export interface VendorUserUpdatePayload {
  name: string;
  email: string;
  password?: string;
  vendor_id: number;
  is_active?: boolean;
  shop_ids?: number[];
}
