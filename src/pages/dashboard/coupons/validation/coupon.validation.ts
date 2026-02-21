import { z } from 'zod';

export const CouponSchema = z.object({
  name: z.object({
    en: z.string().min(1, 'English name is required'),
    ar: z.string().min(1, 'Arabic name is required'),
  }),
  code: z.string().min(1, 'Code is required'),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.string().min(1, 'Discount value is required'),
  start_at: z.string().min(1, 'Start date is required'),
  end_at: z.string().min(1, 'End date is required'),
  max_uses: z.coerce.number().min(0, 'Max uses must be >= 0'),
  is_active: z.boolean(),
  coupon_type: z.enum(['general', 'product', 'vendor']),
  product_ids: z.array(z.number()).optional(),
  vendor_ids: z.array(z.number()).optional(),
}).superRefine((data, ctx) => {
  if (data.coupon_type === 'product' && (!data.product_ids || data.product_ids.length === 0)) {
    ctx.addIssue({ code: 'custom', message: 'Please select at least one product', path: ['product_ids'] });
  }
  if (data.coupon_type === 'vendor' && (!data.vendor_ids || data.vendor_ids.length === 0)) {
    ctx.addIssue({ code: 'custom', message: 'Please select at least one vendor', path: ['vendor_ids'] });
  }
});

export type CouponFormValues = z.infer<typeof CouponSchema>;
