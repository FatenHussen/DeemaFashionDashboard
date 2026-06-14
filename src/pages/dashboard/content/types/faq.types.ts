// ── FAQ types ─────────────────────────────────────────────────────────

export const FAQ_TYPES = ['orders', 'delivery', 'payments', 'account', 'stores&drivers', 'other'] as const;
export type FaqType = (typeof FAQ_TYPES)[number];

// ── List response  GET /admin/faqs ────────────────────────────────────

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  type: string;
  /** Normalized from list API (`is_active`, `is_visible`, `visibility`, etc.) for admin toggles. */
  is_active?: boolean;
}

export interface FaqListResponse {
  status: boolean;
  message: string;
  data: {
    items: FaqItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

// ── Details response  GET /admin/faqs/:id ─────────────────────────────

export interface FaqMultilingual {
  en: string;
  ar: string;
}

export interface FaqDetails {
  id: number;
  question: FaqMultilingual;
  answer: FaqMultilingual;
  type: string;
}

export interface FaqDetailsResponse {
  status: boolean;
  message: string;
  data: FaqDetails;
}

// ── Create / Update payload ───────────────────────────────────────────

export interface FaqPayload {
  question: FaqMultilingual;
  answer: FaqMultilingual;
  type: string;
}
