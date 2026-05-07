import { z } from 'zod';

import { issueIfPercentageDiscountOver100 } from 'src/utils/discount-percentage-zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const PromotionSchema = z
  .object({
    name: z.object({
      en: z.string().min(1, t('promotion.nameEnRequired')),
      ar: z.string().min(1, t('promotion.nameArRequired')),
    }),
    description: z.object({
      en: z.string().min(1, t('promotion.descriptionEnRequired')),
      ar: z.string().min(1, t('promotion.descriptionArRequired')),
    }),
    type: z.enum(['simple_discount', 'spend_x_discount', 'buy_x_get_y']),
    is_active: z.boolean().optional(),
    starts_at: z.string().optional(),
    ends_at: z.string().optional(),
    min_spend: z.number().optional().nullable(),
    buy_quantity: z.number().optional().nullable(),
    get_quantity: z.number().optional().nullable(),
    discount_value: z.number().optional().nullable(),
    discount_type: z.enum(['percentage', 'fixed']).optional().nullable(),
    page_slugs: z.array(z.string()).optional().default([]),
    position: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? 0 : val),
      z.coerce.number().int().min(0)
    ),
  })
  .superRefine((data, ctx) => {
    const usesDiscount = data.type === 'simple_discount' || data.type === 'spend_x_discount';
    if (!usesDiscount) return;
    issueIfPercentageDiscountOver100(ctx, data.discount_type ?? undefined, data.discount_value, [
      'discount_value',
    ]);
  });

export type PromotionFormValues = z.infer<typeof PromotionSchema>;
