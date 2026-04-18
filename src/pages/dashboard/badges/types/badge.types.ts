export type BadgePosition = 'top' | 'bottom';

export interface BadgeItem {
  id: number;
  name: string | { en: string; ar: string } | null;
  color: string | null;
  position: BadgePosition;
  image?: string | null;
}

export interface BadgeListResponse {
  status: boolean;
  message: string;
  data: {
    items: BadgeItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface BadgeDetailsResponse {
  status: boolean;
  message: string;
  data: BadgeItem;
}

export interface BadgeCreatePayload {
  name?: { en?: string; ar?: string };
  color?: string;
  position: BadgePosition;
  image?: File | null;
}
