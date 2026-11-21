// ----------------------------------------------------------------------

export type CityTaxType = 'percent' | 'fixed';

export interface GovernorateInfo {
  id: number;
  name: string;
  created_at: string;
}

export interface CityData {
  id: number;
  name: {
    ar: string;
    en: string;
  };
  governorate: GovernorateInfo;
  tax_type?: CityTaxType | string | null;
  tax_value?: number | string | null;
  /** Legacy percent field; prefer `tax_value` when present. */
  tax_rate?: number | string | null;
  created_at: string;
}

export interface CityListResponse {
  status: boolean;
  message: string;
  data: {
    items: CityData[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface CityCreateUpdatePayload {
  name: {
    en: string;
    ar: string;
  };
  governorate_id: number;
  tax_type: CityTaxType;
  tax_value: number;
  /** Compat: equals `tax_value` for percent, `0` for fixed. */
  tax_rate: number;
}
