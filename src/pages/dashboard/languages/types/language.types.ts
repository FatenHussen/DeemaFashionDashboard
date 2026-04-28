// ----------------------------------------------------------------------

export interface LanguageData {
  id: number;
  code: string;
  native_name: string;
  direction: 'ltr' | 'rtl';
  is_active: boolean;
  is_default: boolean;
  order: number;
  flag_icon: string;
  created_at: string;
  updated_at: string;
}

export interface LanguageListResponse {
  status: boolean;
  message: string;
  data: {
    items: LanguageData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface LanguageDetailsResponse {
  status: boolean;
  message: string;
  data: LanguageData;
}

export interface LanguageCreateUpdatePayload {
  code: string;
  native_name: string;
  direction: 'ltr' | 'rtl';
  is_active: number | boolean;
  is_default: number | boolean;
  flag_icon: File | string | undefined;
}

export interface LanguageFormValues {
  code: string;
  native_name: string;
  direction: 'ltr' | 'rtl';
  is_active: boolean;
  is_default: boolean;
  flag_icon: File | null;
}

export interface LanguageListParams {
  page?: number;
  limit?: number;
  code?: string;
  is_active?: number;
  direction?: 'ltr' | 'rtl';
  search?: string;
}
