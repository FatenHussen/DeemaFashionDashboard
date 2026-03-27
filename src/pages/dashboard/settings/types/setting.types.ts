export interface SettingItem {
  id: number;
  key: string;
  type: 'string' | 'boolean' | 'number' | 'json' | 'file';
  value: string | boolean | number | object | null;
  created_at: string;
  updated_at: string;
}

/** GET /admin/settings may return a flat array or a paginated envelope. */
export type SettingListData =
  | SettingItem[]
  | {
      items: SettingItem[];
      pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      };
    };

export interface SettingListResponse {
  status: boolean;
  message: string;
  data: SettingListData;
}

export function settingsItemsFromListData(data: SettingListData | undefined): SettingItem[] {
  if (!data) return [];
  return Array.isArray(data) ? data : data.items ?? [];
}

export interface SettingDetailsResponse {
  status: boolean;
  message: string;
  data: SettingItem;
}
