// ----------------------------------------------------------------------
// User Gifts - هدايا المستخدمين (assigned by admin)
// API: POST/GET/PUT/DELETE /api/admin/user-gifts
// ----------------------------------------------------------------------

export type UserGiftStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface UserGiftGiftRef {
  id: number;
  name: { ar?: string; en?: string } | string;
  image?: string;
  points_required?: number;
  description?: { ar?: string; en?: string } | string;
}

export interface UserGiftUserRef {
  id: number;
  name: string;
  phone?: string;
  email?: string;
}

export interface UserGiftAddressRef {
  id: number;
  full_address?: string;
  city?: { ar?: string; en?: string } | string;
  area?: { ar?: string; en?: string } | string;
}

export interface UserGiftData {
  id: number;
  gift: UserGiftGiftRef;
  user: UserGiftUserRef;
  address: UserGiftAddressRef | null;
  status: UserGiftStatus;
  admin_notes?: string | null;
  user_notes?: string | null;
  delivered_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface UserGiftListResponse {
  status: boolean;
  message?: string;
  data:
    | UserGiftData[]
    | {
        items: UserGiftData[];
        pagination?: {
          current_page: number;
          last_page: number;
          per_page: number;
          total: number;
        };
      };
  meta?: {
    current_page: number;
    total: number;
    per_page: number;
  };
}

export interface UserGiftDetailsResponse {
  status: boolean;
  message?: string;
  data: UserGiftData;
}

export interface UserGiftCreatePayload {
  user_id: number;
  gift_id: number;
  address_id?: number | null;
  status?: UserGiftStatus;
  admin_notes?: string | null;
}

export interface UserGiftUpdatePayload {
  status?: UserGiftStatus;
  admin_notes?: string | null;
}
