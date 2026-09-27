import { z } from 'zod';

import { issueIfPercentageDiscountOver100 } from 'src/utils/discount-percentage-zod';

import i18n from 'src/lib/i18n';

import { PROMOTION_TYPES } from '../types/promotion.types';
import { fieldsForPromotionType } from '../utils/promotion-fields';

const optionalNumber = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z.number().optional().nullable()
);

const optionalDiscountType = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z.enum(['percentage', 'fixed']).optional().nullable()
);

const t = (key: string) => i18n.t(key, { ns: 'validation' });

function isBlankNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return true;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(n);
}

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
    type: z.enum(PROMOTION_TYPES),
    is_active: z.boolean().optional(),
    starts_at: z.string().optional(),
    ends_at: z.string().optional(),
    min_spend: optionalNumber,
    buy_quantity: z.number().optional().nullable(),
    get_quantity: z.number().optional().nullable(),
    discount_value: optionalNumber,
    discount_type: optionalDiscountType,
    gift_description: z
      .object({
        en: z.string().optional().default(''),
        ar: z.string().optional().default(''),
      })
      .optional(),
    reward_points: optionalNumber,
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
    const fields = new Set(fieldsForPromotionType(data.type));

    if (fields.has('discount_value') || fields.has('discount_type')) {
      if (isBlankNumber(data.discount_value) || Number(data.discount_value) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('promotion.discountValueRequired'),
          path: ['discount_value'],
        });
      }
      if (!data.discount_type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('promotion.discountTypeRequired'),
          path: ['discount_type'],
        });
      }
      issueIfPercentageDiscountOver100(ctx, data.discount_type ?? undefined, data.discount_value, [
        'discount_value',
      ]);
    }

    if (fields.has('min_spend') && (isBlankNumber(data.min_spend) || Number(data.min_spend) <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('promotion.minSpendRequired'),
        path: ['min_spend'],
      });
    }

    if (fields.has('gift_description')) {
      if (!data.gift_description?.en?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('promotion.giftDescriptionEnRequired'),
          path: ['gift_description', 'en'],
        });
      }
      if (!data.gift_description?.ar?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('promotion.giftDescriptionArRequired'),
          path: ['gift_description', 'ar'],
        });
      }
    }

    if (
      fields.has('reward_points') &&
      (isBlankNumber(data.reward_points) || Number(data.reward_points) <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('promotion.rewardPointsRequired'),
        path: ['reward_points'],
      });
    }
  });

export type PromotionFormValues = z.infer<typeof PromotionSchema>;
