/**
 * Maps between dashboard form values and Laravel `PopupCampaignRequest`.
 */

import {
  POPUP_TRIGGER_TYPES,
  POPUP_AUDIENCE_TYPES,
  type PopupCampaignType,
  type PopupCampaignTriggerType,
  type PopupCampaignAudienceType,
} from '../types';

/** Backend `AUDIENCE_TYPES` — pass-through for form values. */
export function toApiAudienceType(ui: string): string {
  return ui;
}

const LEGACY_AUDIENCE: Record<string, PopupCampaignAudienceType> = {
  all: 'all_visitors',
  all_visitors: 'all_visitors',
  guest: 'guests_only',
  guests: 'guests_only',
  guests_only: 'guests_only',
  logged_in: 'logged_in_only',
  logged_in_only: 'logged_in_only',
  new_visitor: 'new_visitors',
  new_visitors: 'new_visitors',
  returning_visitor: 'returning_visitors',
  returning_visitors: 'returning_visitors',
};

export function fromApiAudience(api: string): PopupCampaignAudienceType {
  const v = String(api ?? '').trim();
  if (LEGACY_AUDIENCE[v]) return LEGACY_AUDIENCE[v];
  if ((POPUP_AUDIENCE_TYPES as readonly string[]).includes(v)) {
    return v as PopupCampaignAudienceType;
  }
  return 'all_visitors';
}

export function fromApiTrigger(api: string): PopupCampaignTriggerType {
  const v = String(api ?? '').trim();
  if ((POPUP_TRIGGER_TYPES as readonly string[]).includes(v)) {
    return v as PopupCampaignTriggerType;
  }
  return 'on_load';
}

const UI_TYPES = new Set(['modal', 'slide_in', 'fullscreen']);
const UI_STATUS = new Set(['draft', 'active', 'paused', 'archived']);

/** Translatable JSON strings for Laravel casts. */
export function encodeLocaleJson(loc: { en: string; ar: string }): string {
  return JSON.stringify({ en: loc.en ?? '', ar: loc.ar ?? '' });
}

export function slugify(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
  return s || 'campaign';
}

export function fromApiType(api: string): PopupCampaignType {
  if (api === 'banner' || api === 'announcement') return 'modal';
  if (UI_TYPES.has(api)) return api as PopupCampaignType;
  return 'modal';
}

export function toApiStatus(ui: string): string {
  return ui;
}

export function fromApiStatus(api: string): string {
  if (api === 'ended' || api === 'scheduled') return 'archived';
  if (UI_STATUS.has(api)) return api;
  return 'draft';
}
