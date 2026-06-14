/**
 * Admin popup campaigns — aligns with `PopupCampaign` admin resource.
 * HTTP routes use `apiRoutes.popupCampaign` (`/admin/popup-campaigns` relative to `VITE_SERVER_URL`; with a typical base
 * like `https://host/api` this is `/api/admin/popup-campaigns`).
 * Translatable fields are `{ ar, en }` objects. Primary CTA destination is `button_url` only (`cta_type` / `cta_value` removed).
 */

export type LocalizedString = { en: string; ar: string };

/** Popup shell: modal, slide-in (side/top/bottom on storefront), or fullscreen. */
export type PopupCampaignType = 'modal' | 'slide_in' | 'fullscreen';

/** Campaign lifecycle. */
export type PopupCampaignStatus = 'draft' | 'active' | 'paused' | 'archived';

export type PopupCampaignMediaType = 'image' | 'video' | 'gif';

/** Matches backend `AUDIENCE_*` / `AUDIENCE_TYPES`. */
export const POPUP_AUDIENCE_TYPES = [
  'all_visitors',
  'guests_only',
  'logged_in_only',
  'new_visitors',
  'returning_visitors',
] as const;

export type PopupCampaignAudienceType = (typeof POPUP_AUDIENCE_TYPES)[number];

/** Matches backend `TRIGGER_*` / `TRIGGER_TYPES`. */
export const POPUP_TRIGGER_TYPES = [
  'on_load',
  'delay',
  'scroll',
  'exit_intent',
] as const;

export type PopupCampaignTriggerType = (typeof POPUP_TRIGGER_TYPES)[number];

export interface PopupCampaignListItem {
  id: number;
  slug?: string;
  priority?: number;
  title: string | LocalizedString;
  headline?: string | LocalizedString;
  subheadline?: string | LocalizedString;
  description?: string | LocalizedString;
  type: PopupCampaignType | string;
  status: PopupCampaignStatus | string;
  button_text?: string;
  button_url?: string | null;
  secondary_button_text?: string | null;
  media_type?: PopupCampaignMediaType | string;
  media_path?: string | null;
  audience_type?: PopupCampaignAudienceType | string;
  trigger_type?: PopupCampaignTriggerType | string;
  trigger_value?: number | null;
  form_enabled?: boolean;
  form_fields?: string[] | null;
  show_on_pages?: string[] | null;
  show_every?: number;
  max_impressions?: number;
  product_ids?: number[] | null;
  shop_ids?: number[] | null;
  recipe_ids?: number[] | null;
  promotion_ids?: number[] | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface PopupCampaignDetail {
  id: number;
  slug?: string;
  priority?: number;
  title: LocalizedString | string;
  headline: LocalizedString | string;
  subheadline?: LocalizedString | string | null;
  description?: LocalizedString | string | null;
  type: PopupCampaignType | string;
  status: PopupCampaignStatus | string;
  button_text: string;
  button_url?: string | null;
  secondary_button_text?: string | null;
  media_type: PopupCampaignMediaType | string;
  media_path?: string | null;
  form_enabled?: boolean;
  form_fields?: string[] | null;
  show_on_pages?: string[] | null;
  audience_type?: PopupCampaignAudienceType | string;
  trigger_type?: PopupCampaignTriggerType | string;
  trigger_value?: number | null;
  show_every?: number;
  max_impressions?: number;
  product_ids?: number[] | null;
  shop_ids?: number[] | null;
  recipe_ids?: number[] | null;
  promotion_ids?: number[] | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface PopupCampaignListResponse {
  status: boolean;
  message: string;
  data: {
    items: PopupCampaignListItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface PopupCampaignDetailResponse {
  status: boolean;
  message: string;
  data: PopupCampaignDetail;
}

/**
 * Fields sent with create/update (multipart form body).
 * Media is uploaded as the `media_path` file field — not a URL string.
 */
export interface PopupCampaignUpsertPayload {
  title: LocalizedString;
  slug: string;
  type: PopupCampaignType;
  status: PopupCampaignStatus;
  priority: number;
  headline: LocalizedString;
  subheadline?: LocalizedString | null;
  description?: LocalizedString | null;
  button_text: string;
  button_url?: string | null;
  secondary_button_text?: string | null;
  media_type: PopupCampaignMediaType;
  form_enabled: boolean;
  form_fields?: string[] | null;
  show_on_pages?: string[] | null;
  audience_type: PopupCampaignAudienceType;
  trigger_type: PopupCampaignTriggerType;
  trigger_value?: number | null;
  /** Optional targeting — omit or null when empty. */
  product_ids?: number[] | null;
  shop_ids?: number[] | null;
  recipe_ids?: number[] | null;
  promotion_ids?: number[] | null;
}
