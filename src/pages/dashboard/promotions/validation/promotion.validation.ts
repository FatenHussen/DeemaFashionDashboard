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
    type: z.enum([
      'simple_discount',
      'spend_x_discount',
      'spend_x_get_gift',
      'spend_x_get_points',
      'free_shipping',
      'spend_x_get_free_shipping',
    ]),
    is_active: z.boolean().optional(),
    starts_at: z.string().optional(),
    ends_at: z.string().optional(),
    min_spend: z.number().optional().nullable(),
    buy_quantity: z.number().optional().nullable(),
    get_quantity: z.number().optional().nullable(),
    discount_value: z.number().optional().nullable(),
    discount_type: z.enum(['percentage', 'fixed']).optional().nullable(),
    gift_product_ids: z.array(z.number()).optional().default([]),
    product_ids: z.array(z.number()).optional().default([]),
    shop_ids: z.array(z.number()).optional().default([]),
    restaurant_ids: z.array(z.number()).optional().default([]),
    recipe_ids: z.array(z.number()).optional().default([]),
    shop_vendor_service_ids: z.array(z.coerce.number().int().positive()).optional().default([]),
    page_slugs: z.array(z.string()).optional().default([]),
    position: z.enum(['top', 'bottom']).optional().default('top'),
  })
  .superRefine((data, ctx) => {
    const usesDiscount = data.type === 'simple_discount' || data.type === 'spend_x_discount';
    if (!usesDiscount) return;
    issueIfPercentageDiscountOver100(ctx, data.discount_type ?? undefined, data.discount_value, [
      'discount_value',
    ]);
  });

export type PromotionFormValues = z.infer<typeof PromotionSchema>;
