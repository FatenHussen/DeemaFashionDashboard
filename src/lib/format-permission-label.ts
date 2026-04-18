import type { TFunction } from 'i18next';

/** Longest-first tokens for humanizing unknown resource slugs (English display fallback). */
const RESOURCE_WORDS = [
  'affiliatewithdrawrequest',
  'userbasketschedule',
  'schedulebasket',
  'sellerregistration',
  'shopvendorservice',
  'vendorservicetype',
  'vendorsubscription',
  'vendorpackage',
  'promotionrequest',
  'categoryattribute',
  'categorydetail',
  'legaldocument',
  'activitylog',
  'pointexchange',
  'pointwallet',
  'pagesection',
  'quickaction',
  'flashsale',
  'pointrule',
  'serviceorder',
  'vendoruser',
  'salecountry',
  'notification',
  'subscription',
  'governorate',
  'complaint',
  'promotion',
  'statistics',
  'affiliate',
  'registration',
  'withdrawrequest',
  'withdraw',
  'attribute',
  'inventory',
  'category',
  'currency',
  'country',
  'schedule',
  'package',
  'request',
  'section',
  'product',
  'service',
  'vendor',
  'banner',
  'recipe',
  'basket',
  'coupon',
  'driver',
  'order',
  'gift',
  'role',
  'admin',
  'user',
  'city',
  'area',
  'shop',
  'brand',
  'stats',
  'reports',
  'point',
  'page',
  'quick',
  'action',
  'sale',
  'detail',
  'exchange',
  'rule',
  'wallet',
  'activity',
  'seller',
  'document',
  'legal',
  'faq',
  'icon',
  'badge',
  'color',
];

const RESOURCE_WORDS_SORTED = [...RESOURCE_WORDS].sort((a, b) => b.length - a.length);

function normalizePermissionKey(raw: string): string {
  return raw.trim().replace(/\s+/g, '').toLowerCase();
}

function resourceI18nKey(resource: string): string {
  return resource.replace(/\./g, '_');
}

function capitalize(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function tokenizeResourceSlug(slug: string): string[] {
  const s = slug.toLowerCase().replace(/\./g, '');
  const tokens: string[] = [];
  let i = 0;
  while (i < s.length) {
    let matched = false;
    for (const w of RESOURCE_WORDS_SORTED) {
      if (s.startsWith(w, i)) {
        tokens.push(w);
        i += w.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push(s[i] ?? '');
      i += 1;
    }
  }
  return tokens.filter(Boolean);
}

function humanizeUnknownResourceSlug(resource: string): string {
  const flat = resource.replace(/\./g, '');
  const tokens = tokenizeResourceSlug(flat);
  const merged = tokens.map((t) => capitalize(t)).join(' ');
  if (merged.length > 1) return merged;
  return capitalize(flat || resource);
}

/**
 * Returns a human-readable label for a backend permission key in the current language.
 * Uses `common.permAction.*`, `common.permResource.*`, and `common.permLabelFormat`.
 */
export function formatPermissionLabel(rawKey: string, t: TFunction): string {
  const key = normalizePermissionKey(rawKey);
  const parts = key.split('.');
  if (parts.length < 2) {
    return rawKey.trim();
  }

  const action = parts[parts.length - 1] ?? '';
  const resource = parts.slice(0, -1).join('.');
  const rk = resourceI18nKey(resource);

  const actionLabel = t(`permAction.${action}`, {
    defaultValue: capitalize(action),
  });

  const resourceLabel = t(`permResource.${rk}`, {
    defaultValue: humanizeUnknownResourceSlug(resource),
  });

  return t('permLabelFormat', {
    action: actionLabel,
    resource: resourceLabel,
    defaultValue: `${actionLabel} · ${resourceLabel}`,
  });
}
