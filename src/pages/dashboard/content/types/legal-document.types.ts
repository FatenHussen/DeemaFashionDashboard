// ── List response  GET /admin/legal-documents ─────────────────────────

export interface LegalDocumentItem {
  id: number;
  key: string;
  title: string;
  content: string;
  created_at: string;
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
}

export interface LegalDocumentDetailsResponse {
  status: boolean;
  message: string;
  data: LegalDocumentDetails;
}

// ── Update payload  PATCH /admin/legal-documents/:id ──────────────────

export interface LegalDocumentUpdatePayload {
  title: LegalDocumentMultilingual;
  content: LegalDocumentMultilingual;
}
