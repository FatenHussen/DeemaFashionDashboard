export interface BadgeItem {
  id: number;
  name: string | { en: string; ar: string };
  color: string;
  postion: number | null;
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
  name: { en: string; ar: string };
  color: string;
}
