export interface ActivityLogItem {
  id: number;
  user: string;
  user_type: string;
  action: string;
  model: string;
  model_id: number;
  changes: Record<string, { old: any; new: any }> | null;
  date: string;
  message: string;
}

export interface ActivityLogListResponse {
  items: ActivityLogItem[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
