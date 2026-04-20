export interface DeliveryDistanceRangeItem {
  id: number;
  min_distance: number;
  max_distance: number | null;
  multiplier: number;
  created_at: string;
}

export interface DeliveryDistanceRangeListResponse {
  data: {
    items: DeliveryDistanceRangeItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    } | null;
  };
}

export interface DeliveryDistanceRangeDetailsResponse {
  data: DeliveryDistanceRangeItem;
}

export interface DeliveryDistanceRangePayload {
  min_distance: number;
  max_distance: number | null;
  multiplier: number;
}
