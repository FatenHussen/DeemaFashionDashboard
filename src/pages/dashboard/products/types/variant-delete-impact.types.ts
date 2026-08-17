/**
 * Payload describing everything a variant delete would touch.
 *
 * Returned by `GET .../delete-impact` (preview, deletes nothing), by the `409` body when a
 * delete needs confirmation, and by the `200` body describing what was actually removed.
 */

/** Which endpoint family the impact belongs to. */
export type VariantDeleteImpactType = 'product_variant' | 'shop_product_variant';

/** Keys the backend documents for `counts` — unknown keys are still rendered generically. */
export type VariantDeleteImpactCountKey =
  | 'active_orders'
  | 'past_orders'
  | 'basket_items'
  | 'recipe_items'
  | 'scheduled_items'
  | 'gifts'
  | 'shop_variants'
  | 'images';

export type VariantDeleteImpactCounts = Partial<Record<VariantDeleteImpactCountKey, number>> &
  Record<string, number | undefined>;

/** Pre-localized line, ready to render as-is (follows the request's `Accept-Language`). */
export interface VariantDeleteImpactWarning {
  key: string;
  count: number;
  message: string;
}

/** Sample of active orders (max 10) shown inside the confirmation dialog. */
export interface VariantDeleteImpactOrder {
  id: number;
  order_code?: string | null;
  status?: string | null;
}

export interface VariantDeleteImpact {
  type: VariantDeleteImpactType;
  id: number;
  requires_confirmation?: boolean;
  counts?: VariantDeleteImpactCounts;
  warnings?: VariantDeleteImpactWarning[];
  active_orders?: VariantDeleteImpactOrder[];
}

/** Envelope shared by the `delete-impact` preview and both delete outcomes. */
export interface VariantDeleteImpactResponse {
  status?: boolean;
  message?: string;
  requires_confirmation?: boolean;
  data?: VariantDeleteImpact | null;
}

/** True when the impact lists at least one thing worth warning the user about. */
export function hasVariantDeleteImpact(impact: VariantDeleteImpact | null | undefined): boolean {
  if (!impact) return false;
  if (impact.warnings?.length) return true;
  return Object.values(impact.counts ?? {}).some((count) => Number(count) > 0);
}
