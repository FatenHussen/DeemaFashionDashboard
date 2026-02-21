// ----------------------------------------------------------------------

export interface BannerItem {
  id: number;
  title: string;
  description: string | { en?: string; ar?: string } | null;
  image_url: string;
  link?: string;
  is_active: number;
  order: number;
  created_at: string;
}

export interface BannerListResponse {
  status: boolean;
  message: string;
  data: {
    items: BannerItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface BannerCreatePayload {
  'title.en': string;
  'title.ar': string;
  description: string;
  image: File;
  link: string;
}

export interface BannerUpdatePayload {
  _method: 'PATCH';
  'title.en': string;
  'title.ar': string;
  'description.en': string;
  image?: File;
  link: string;
}

export interface BannerFormValues {
  title: {
    en: string;
    ar: string;
  };
  description: string;
  image: File | null;
  link: string;
}
