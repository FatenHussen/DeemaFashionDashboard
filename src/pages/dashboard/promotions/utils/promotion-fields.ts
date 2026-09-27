import type { PromotionType } from '@/pages/dashboard/promotions/types/promotion.types';

import { PROMOTION_TYPES } from '@/pages/dashboard/promotions/types/promotion.types';

export { PROMOTION_TYPES };

export const PROMOTION_TYPE_LABEL_KEYS: Record<PromotionType, string> = {
  simple_discount: 'promotionTypes.simpleDiscount',
  free_shipping: 'promotionTypes.freeShipping',
  first_order_discount: 'promotionTypes.firstOrderDiscount',
  first_order_free_shipping: 'promotionTypes.firstOrderFreeShipping',
  first_order_gift: 'promotionTypes.firstOrderGift',
  spend_x_discount: 'promotionTypes.spendXDiscount',
  spend_x_get_free_shipping: 'promotionTypes.spendXGetFreeShipping',
  spend_x_get_gift: 'promotionTypes.spendXGetGift',
  spend_x_get_points: 'promotionTypes.spendXGetPoints',
  signup_discount: 'promotionTypes.signupDiscount',
  signup_free_shipping: 'promotionTypes.signupFreeShipping',
  signup_gift: 'promotionTypes.signupGift',
};

export const PROMOTION_TYPE_COLORS: Record<string, string> = {
  simple_discount: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  spend_x_discount: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  spend_x_get_gift: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  spend_x_get_points: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  free_shipping: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  spend_x_get_free_shipping: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  first_order_discount: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  first_order_free_shipping: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  first_order_gift: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  signup_discount: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  signup_free_shipping: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  signup_gift: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400',
};

/** Extra inputs the create/edit form shows for a promotion type. */
export const PROMOTION_FIELD_NAMES = [
  'discount_value',
  'discount_type',
  'min_spend',
  'gift_description',
  'reward_points',
  'gift_product_ids',
] as const;

export type PromotionFieldName = (typeof PROMOTION_FIELD_NAMES)[number];

const FIELD_NAME_SET = new Set<string>(PROMOTION_FIELD_NAMES);

/**
 * Documented fields per type. Used when `GET /promotions/fields-for-type/{type}`
 * is unavailable or does not name any known inputs.
 */
const FIELDS_BY_TYPE: Record<PromotionType, readonly PromotionFieldName[]> = {
  simple_discount: ['discount_value', 'discount_type'],
  free_shipping: [],
  first_order_discount: ['discount_value', 'discount_type'],
  first_order_free_shipping: [],
  first_order_gift: ['gift_description'],
  spend_x_discount: ['min_spend', 'discount_value', 'discount_type'],
  spend_x_get_free_shipping: ['min_spend'],
  spend_x_get_gift: ['min_spend', 'gift_description'],
  spend_x_get_points: ['min_spend', 'reward_points'],
  signup_discount: ['discount_value', 'discount_type'],
  signup_free_shipping: [],
  signup_gift: ['gift_description'],
};

export function isPromotionFieldName(value: string): value is PromotionFieldName {
  return FIELD_NAME_SET.has(value);
}

export function fieldsForPromotionType(type: string): PromotionFieldName[] {
  if (type in FIELDS_BY_TYPE) return [...FIELDS_BY_TYPE[type as PromotionType]];
  return [];
}

export type PromotionTrigger = 'first_order' | 'spend' | 'signup' | 'other';

export function promotionTrigger(type: string): PromotionTrigger {
  if (type.startsWith('first_order')) return 'first_order';
  if (type.startsWith('spend_x')) return 'spend';
  if (type.startsWith('signup')) return 'signup';
  return 'other';
}

function addFieldName(names: Set<PromotionFieldName>, value: unknown) {
  if (typeof value === 'string' && isPromotionFieldName(value)) names.add(value);
}

function visitFieldNode(value: unknown, names: Set<PromotionFieldName>, depth: number) {
  if (depth > 5 || value == null) return;
  addFieldName(names, value);
  if (Array.isArray(value)) {
    for (const item of value) visitFieldNode(item, names, depth + 1);
    return;
  }
  if (typeof value !== 'object') return;

  const record = value as Record<string, unknown>;
  addFieldName(names, record.name);
  addFieldName(names, record.field);
  addFieldName(names, record.key);
  addFieldName(names, record.slug);

  for (const key of Object.keys(record)) {
    if (isPromotionFieldName(key) && record[key] !== false && record[key] != null) {
      names.add(key);
    }
  }

  for (const key of ['fields', 'required', 'optional', 'items', 'inputs']) {
    if (key in record) visitFieldNode(record[key], names, depth + 1);
  }
}

/** Pull known field names out of the fields-for-type response. */
export function parsePromotionFieldNames(body: unknown): PromotionFieldName[] | null {
  if (body == null) return null;
  const root =
    typeof body === 'object' && body !== null && 'data' in body
      ? (body as { data: unknown }).data
      : body;
  const names = new Set<PromotionFieldName>();
  visitFieldNode(root, names, 0);
  return names.size ? [...names] : null;
}

export function resolvePromotionFields(
  type: string,
  body: unknown,
  isSuccess: boolean
): PromotionFieldName[] {
  const fallback = fieldsForPromotionType(type);
  if (!isSuccess) return fallback;
  const parsed = parsePromotionFieldNames(body);
  if (!parsed?.length) return fallback;
  return [...new Set<PromotionFieldName>([...fallback, ...parsed])];
}
