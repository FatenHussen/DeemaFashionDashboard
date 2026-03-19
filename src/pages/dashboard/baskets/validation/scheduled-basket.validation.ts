import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const ScheduledBasketSchema = z.object({
  category_id: z.coerce.number().min(1, t('scheduledBasket.categoryRequired')),
  name: z.object({
    en: z.string().min(1, t('scheduledBasket.nameEnRequired')),
    ar: z.string().min(1, t('scheduledBasket.nameArRequired')),
  }),
  offer_ends_at: z.string().optional(),
  discount: z.coerce.number().min(0).optional(),
  discount_type: z.enum(['fixed', 'percentage']),
  delivery_price: z.coerce.number().min(0).optional(),
  image: z.instanceof(File).optional().or(z.literal('')).or(z.null()),
  items: z
    .array(
      z.object({
        shop_product_variant_id: z.coerce.number().min(1, t('scheduledBasket.productVariantRequired')),
        quantity: z.coerce.number().min(1, t('scheduledBasket.quantityMin')),
      })
    )
    .min(1, t('scheduledBasket.atLeastOneItem')),
  scheduled_at: z.string().min(1, t('scheduledBasket.scheduledDateRequired')),
  scheduled_end_at: z.string().optional(),
  is_recurring: z.boolean(),
  recurrence_type: z.enum(['daily', 'weekly', 'monthly']).optional(),
  is_active: z.boolean(),
});

export type ScheduledBasketFormValues = z.infer<typeof ScheduledBasketSchema>;
