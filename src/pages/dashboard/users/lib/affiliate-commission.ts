import type { AffiliateCommissionType } from '../types/user.types';

export type AffiliateCommissionPayloadInput = {
  affiliate_commission_type: AffiliateCommissionType;
  affiliate_id?: string | number | null;
  affiliate_rate?: number | null;
  affiliate_fixed_commission?: number | null;
  affiliate_product_ids?: (number | string)[] | null;
  affiliate_visit_commission_enabled?: boolean;
  affiliate_visit_commission_threshold?: number | null;
  affiliate_visit_commission_amount?: number | null;
};

export function buildAffiliateCommissionPayload(data: AffiliateCommissionPayloadInput): Record<string, unknown> {
  const { affiliate_commission_type: type } = data;
  const out: Record<string, unknown> = { affiliate_commission_type: type };

  const id = data.affiliate_id;
  if (id !== undefined && id !== null && String(id).trim() !== '') {
    out.affiliate_id = id;
  }

  if (type === 'percentage_order') {
    out.affiliate_rate = data.affiliate_rate;
  } else if (type === 'fixed_per_order') {
    out.affiliate_fixed_commission = data.affiliate_fixed_commission;
  } else {
    out.affiliate_rate = data.affiliate_rate;
    out.affiliate_product_ids = (data.affiliate_product_ids ?? []).map((x) =>
      typeof x === 'string' ? parseInt(x, 10) : x
    );
  }

  const visitOn = data.affiliate_visit_commission_enabled === true;
  out.affiliate_visit_commission_enabled = visitOn;
  if (visitOn) {
    out.affiliate_visit_commission_threshold = data.affiliate_visit_commission_threshold;
    out.affiliate_visit_commission_amount = data.affiliate_visit_commission_amount;
  }

  return out;
}
