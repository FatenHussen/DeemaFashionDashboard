import { z } from 'zod';

import { issueIfPercentageDiscountOver100 } from 'src/utils/discount-percentage-zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

/** Parse `datetime-local` value as local wall time (avoids UTC ambiguity). */
export function parseCouponDateTimeLocal(s: string): Date | null {
  const m = s.trim().match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const h = Number(m[4]);
  const mi = Number(m[5]);
  const sec = m[6] != null ? Number(m[6]) : 0;
  const dt = new Date(y, mo, d, h, mi, sec, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/** Send UTC ISO string to Laravel (`after:now` / Carbon). */
export function couponLocalDateTimeToISO(s: string): string {
  const d = parseCouponDateTimeLocal(s);
  return d ? d.toISOString() : s;
}

export const COUPON_SCOPE_OPTIONS = ['general', 'product', 'vendor', 'shop'] as const;
export type CouponScope = (typeof COUPON_SCOPE_OPTIONS)[number];

const couponFormBase = z.object({
  name: z.object({
    en: z.string().min(1, t('coupon.nameEnRequired')),
    ar: z.string().min(1, t('coupon.nameArRequired')),
  }),
  code: z.string().min(1, t('coupon.codeRequired')),
  affiliate_id: z.coerce.number().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.string().min(1, t('coupon.discountValueRequired')),
  start_at: z.string().min(1, t('coupon.startDateRequired')),
  end_at: z.string().min(1, t('coupon.endDateRequired')),
  max_uses: z.coerce.number().min(1, t('coupon.maxUsesMin')),
  is_active: z.boolean(),
  coupon_types: z.array(z.enum(COUPON_SCOPE_OPTIONS)).default([]),
  governorate_id: z.number().optional().or(z.null()),
  city_id: z.number().optional().or(z.null()),
  product_ids: z.array(z.number()).optional(),
  vendor_ids: z.array(z.number()).optional(),
  shop_ids: z.array(z.number()).optional(),
});

export type CouponFormValues = z.infer<typeof couponFormBase>;

function scopeRefine(data: CouponFormValues, ctx: z.RefinementCtx) {
  // Affiliate-managed coupons: scope comes from the marketer; form does not require products/vendors.
  const hasAffiliate = data.affiliate_id != null && Number(data.affiliate_id) > 0;
  if (hasAffiliate) return;

  const types = data.coupon_types ?? [];

  if (types.length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: t('coupon.selectAtLeastOneScope'),
      path: ['coupon_types'],
    });
    return;
  }

  if (types.includes('general') && types.length > 1) {
    ctx.addIssue({
      code: 'custom',
      message: t('coupon.generalScopeExclusive'),
      path: ['coupon_types'],
    });
  }

  if (types.includes('product') && (!data.product_ids || data.product_ids.length === 0)) {
    ctx.addIssue({
      code: 'custom',
      message: t('coupon.selectAtLeastOneProduct'),
      path: ['product_ids'],
    });
  }
  if (types.includes('vendor') && (!data.vendor_ids || data.vendor_ids.length === 0)) {
    ctx.addIssue({
      code: 'custom',
      message: t('coupon.selectAtLeastOneVendor'),
      path: ['vendor_ids'],
    });
  }
  if (types.includes('shop') && (!data.shop_ids || data.shop_ids.length === 0)) {
    ctx.addIssue({
      code: 'custom',
      message: t('coupon.selectAtLeastOneShop'),
      path: ['shop_ids'],
    });
  }
}

function endAfterStartRefine(data: CouponFormValues, ctx: z.RefinementCtx) {
  const start = parseCouponDateTimeLocal(data.start_at);
  const end = parseCouponDateTimeLocal(data.end_at);
  if (!start || !end) return;
  if (end.getTime() <= start.getTime()) {
    ctx.addIssue({
      code: 'custom',
      message: t('coupon.endMustBeAfterStart'),
      path: ['end_at'],
    });
  }
}

function discountPercentageRefine(data: CouponFormValues, ctx: z.RefinementCtx) {
  issueIfPercentageDiscountOver100(ctx, data.discount_type, data.discount_value, ['discount_value']);
}

/** Create: API requires start_at after now and max_uses ≥ 1. */
export const CouponCreateSchema = couponFormBase.superRefine((data, ctx) => {
  scopeRefine(data, ctx);
  endAfterStartRefine(data, ctx);
  discountPercentageRefine(data, ctx);

  const start = parseCouponDateTimeLocal(data.start_at);
  if (!start) return;

  const now = new Date();
  if (start.getTime() <= now.getTime()) {
    ctx.addIssue({
      code: 'custom',
      message: t('coupon.startAtMustBeFuture'),
      path: ['start_at'],
    });
  }
});

/** Update: allow start_at in the past; still enforce end after start and scopes. */
export const CouponUpdateSchema = couponFormBase.superRefine((data, ctx) => {
  scopeRefine(data, ctx);
  endAfterStartRefine(data, ctx);
  discountPercentageRefine(data, ctx);
});

/** @deprecated Use CouponCreateSchema or CouponUpdateSchema */
export const CouponSchema = CouponCreateSchema;
