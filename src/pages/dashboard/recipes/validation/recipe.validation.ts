import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

const translationField = z.object({
  ar: z.string().optional().default(''),
  en: z.string().optional().default(''),
});

export const RecipeSchema = z.object({
  name: z.object({
    en: z.string().min(1, t('recipe.nameEnRequired')),
    ar: z.string().min(1, t('recipe.nameArRequired')),
  }),
  description: translationField.optional(),
  image: z.instanceof(File).optional().or(z.literal(null)).or(z.undefined()),
  video_url: z.string().optional().default(''),
  discount: z.coerce.number().min(0).optional().default(0),
  delivery_price: z.coerce.number().min(0).optional().default(0),
  serves: z.string().optional().default(''),
  prepare_time: z.string().optional().default(''),
  items: z.array(
    z.object({
      shop_product_variant_id: z.number().min(1, t('recipe.productVariantRequired')),
      switchable_category_id: z.number().optional(),
      quantity: z.coerce.number().min(1).default(1),
      is_required: z.boolean().default(true),
      min_quantity: z.coerce.number().min(0).default(1),
      max_quantity: z.coerce.number().min(1).default(1),
    })
  ).default([]),
  steps: z.array(
    z.object({
      step_number: z.number(),
      heat_level: translationField,
      time_minutes: translationField,
      instruction: translationField,
    })
  ).default([]),
});

export type RecipeFormValues = z.infer<typeof RecipeSchema>;
