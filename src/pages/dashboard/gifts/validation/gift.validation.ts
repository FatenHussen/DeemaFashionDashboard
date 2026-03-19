import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const GiftSchema = z.object({
  name: z.object({
    ar: z.string().min(1, t('gift.nameArRequired')),
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
  category_id: z.coerce.number().optional(),
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
});

export type GiftFormValues = z.infer<typeof GiftSchema>;
