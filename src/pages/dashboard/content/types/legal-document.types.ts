// ── List response  GET /admin/legal-documents ─────────────────────────

export interface LegalDocumentItem {
  id: number;
  key: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

export interface LegalDocumentListResponse {
  status: boolean;
  message: string;
  data: {
    items: LegalDocumentItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

// ── Details response  GET /admin/legal-documents/:id ──────────────────

export interface LegalDocumentMultilingual {
  en: string;
  ar: string;
}

export interface LegalDocumentDetails {
  id: number;
  key: string;
  title: LegalDocumentMultilingual;
  content: LegalDocumentMultilingual;
  created_at: string;
  updated_at: string;
}

export interface LegalDocumentDetailsResponse {
  status: boolean;
  message: string;
  data: LegalDocumentDetails;
}

// ── Update payload  PATCH /admin/legal-documents/:id ──────────────────

export interface LegalDocumentCreatePayload {
  key: string;
  title: LegalDocumentMultilingual;
  content: LegalDocumentMultilingual;
}

export interface LegalDocumentUpdatePayload {
  key?: string;
  title?: Partial<Record<'en' | 'ar', string | null>>;
  content?: Partial<Record<'en' | 'ar', string | null>>;
}

export interface LegalDocumentListParams {
  page?: number;
  per_page?: number;
  search?: string;
  key?: string;
  sort_field?: 'id' | 'key' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}
