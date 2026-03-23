import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const BasketSchema = z.object({
  category_id: z.coerce.number().min(1, t('basket.categoryRequired')),
  name: z.object({
    en: z.string().min(1, t('basket.nameEnRequired')),
    ar: z.string().min(1, t('basket.nameArRequired')),
  }),
  offer_ends_at: z.string().optional(),
  discount: z.coerce.number().min(0).optional(),
  discount_type: z.enum(['fixed', 'percentage']),
  delivery_price: z.coerce.number().min(0).optional(),
  image: z.instanceof(File).optional().or(z.literal('')).or(z.null()),
  items: z
    .array(
      z.object({
        shop_product_variant_id: z.coerce.number().min(1, t('basket.productVariantRequired')),
        quantity: z.coerce.number().min(1, t('basket.quantityMin')),
      })
    )
    .min(1, t('basket.atLeastOneItem')),
  badges: z
    .array(
      z.object({
        id: z.number(),
        position: z.enum(['top', 'bottom']),
      })
    )
    .default([]),
});

export type BasketFormValues = z.infer<typeof BasketSchema>;
