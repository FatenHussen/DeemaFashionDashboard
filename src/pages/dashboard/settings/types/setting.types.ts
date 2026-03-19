export interface SettingItem {
  id: number;
  key: string;
  type: 'string' | 'boolean' | 'number' | 'json' | 'file';
  value: string | boolean | number | object | null;
  created_at: string;
  updated_at: string;
}

export interface SettingListResponse {
  status: boolean;
  message: string;
  data: {
    items: SettingItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface SettingDetailsResponse {
  status: boolean;
  message: string;
  data: SettingItem;
}
