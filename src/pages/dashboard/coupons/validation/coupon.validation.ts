import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const CouponSchema = z.object({
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
  max_uses: z.coerce.number().min(0, t('coupon.maxUsesMin')),
  is_active: z.boolean(),
  coupon_type: z.enum(['general', 'product', 'vendor']),
  product_ids: z.array(z.number()).optional(),
  vendor_ids: z.array(z.number()).optional(),
}).superRefine((data, ctx) => {
  if (data.coupon_type === 'product' && (!data.product_ids || data.product_ids.length === 0)) {
    ctx.addIssue({ code: 'custom', message: t('coupon.selectAtLeastOneProduct'), path: ['product_ids'] });
  }
  if (data.coupon_type === 'vendor' && (!data.vendor_ids || data.vendor_ids.length === 0)) {
    ctx.addIssue({ code: 'custom', message: t('coupon.selectAtLeastOneVendor'), path: ['vendor_ids'] });
  }
});

export type CouponFormValues = z.infer<typeof CouponSchema>;
