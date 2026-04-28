import { z } from 'zod';

import { issueIfPercentageDiscountOver100 } from 'src/utils/discount-percentage-zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

const translationField = z.object({
  ar: z.string().optional().default(''),
  en: z.string().optional().default(''),
});

export const ScheduledBasketSchema = z
  .object({
    category_ids: z
      .array(z.coerce.number().int().positive())
      .min(1, t('scheduledBasket.categoryRequired')),
    name: z.object({
      en: z.string().min(1, t('scheduledBasket.nameEnRequired')),
      ar: z.string().min(1, t('scheduledBasket.nameArRequired')),
    }),
    description: translationField.optional(),
  discount: z.coerce.number().min(0).optional(),
  discount_type: z.enum(['fixed', 'percentage']),
  delivery_price: z.coerce.number().min(0).optional(),
  image: z.instanceof(File).optional().or(z.literal('')).or(z.null()),
  images: z.array(z.instanceof(File)).optional().default([]),
  items: z
    .array(
      z.object({
        shop_product_variant_id: z.coerce.number().min(1, t('scheduledBasket.productVariantRequired')),
        shop_product_variant_ids: z.array(z.coerce.number()).optional().default([]),
        quantity: z.coerce.number().min(1, t('scheduledBasket.quantityMin')),
        is_required: z.boolean().default(false),
        is_extra: z.boolean().default(false),
        min_quantity: z.coerce.number().min(0).optional(),
        max_quantity: z.coerce.number().min(0).optional(),
      })
    )
    .min(1, t('scheduledBasket.atLeastOneItem')),
  schedules: z
    .array(
      z.object({
        title: z.object({
          en: z.string().optional().default(''),
          ar: z.string().optional().default(''),
        }),
        number_of_days: z.coerce.number().min(1, t('scheduledBasket.numberOfDaysMin')),
        discount_type: z.enum(['percentage', 'fixed']).nullable().optional(),
        discount_value: z.coerce.number().min(0).nullable().optional(),
        is_active: z.boolean().default(true),
        is_default: z.boolean().default(false),
      })
    )
    .min(1, t('scheduledBasket.atLeastOneSchedule'))
    .refine((rows) => rows.filter((r) => r.is_default).length === 1, {
      message: t('scheduledBasket.exactlyOneDefaultSchedule'),
    }),
  is_active: z.boolean(),
  badges: z
    .array(z.number())
    .default([]),
  })
  .superRefine((data, ctx) => {
    issueIfPercentageDiscountOver100(ctx, data.discount_type, data.discount, ['discount']);
    (data.schedules ?? []).forEach((row, i) => {
      issueIfPercentageDiscountOver100(ctx, row.discount_type ?? undefined, row.discount_value, [
        'schedules',
        i,
        'discount_value',
      ]);
    });
  });

export type ScheduledBasketFormValues = z.infer<typeof ScheduledBasketSchema>;
