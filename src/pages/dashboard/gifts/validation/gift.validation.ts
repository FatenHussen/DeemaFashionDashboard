import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const GIFT_MODES = ['tikmool', 'external'] as const;
export type GiftFormMode = (typeof GIFT_MODES)[number];

export const GiftSchema = z
  .object({
    giftMode: z.enum(GIFT_MODES),
    name: z.object({
      ar: z.string(),
      en: z.string().optional(),
    }),
    description: z
      .object({
        ar: z.string().optional(),
        en: z.string().optional(),
      })
      .optional(),
    image: z.instanceof(File).optional().or(z.literal('')).or(z.null()),
    points_required: z.coerce.number().min(1, t('gift.pointsRequiredMin')),
    stock_quantity: z.coerce.number().min(0).optional(),
    is_active: z.boolean(),
    category_id: z.preprocess(
      (v) => (v === '' || v === undefined || v === 0 ? undefined : Number(v)),
      z.number().optional()
    ),
    shop_product_variant_id: z.preprocess(
      (v) => (v === '' || v === undefined || v === 0 ? null : Number(v)),
      z.number().nullable().optional()
    ),
    terms_conditions: z
      .object({
        ar: z.string().optional(),
        en: z.string().optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.giftMode === 'tikmool') {
      if (data.shop_product_variant_id == null || data.shop_product_variant_id <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('gift.variantRequired'),
          path: ['shop_product_variant_id'],
        });
      }
    }
    if (data.giftMode === 'external') {
      if (!data.name.ar?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('gift.nameArRequired'),
          path: ['name', 'ar'],
        });
      }
    }
  });

export type GiftFormValues = z.infer<typeof GiftSchema>;
