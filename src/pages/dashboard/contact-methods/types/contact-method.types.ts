export const CONTACT_METHOD_TYPES = ['number', 'email', 'url', 'whts'] as const;

export type ContactMethodType = (typeof CONTACT_METHOD_TYPES)[number];

export interface ContactMethodItem {
  id: number;
  type: ContactMethodType;
  value: string;
  icon: string | null;
  created_at?: string;
}

export interface ContactMethodListResponse {
  status?: boolean;
  message?: string;
  data: {
    items: ContactMethodItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface ContactMethodDetailsResponse {
  status?: boolean;
  message?: string;
  data: ContactMethodItem;
}

export interface ContactMethodMutationPayload {
  type: ContactMethodType;
  value: string;
  icon?: File | null;
}
