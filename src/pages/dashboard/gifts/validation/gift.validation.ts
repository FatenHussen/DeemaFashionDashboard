import { z } from 'zod';

export const GiftSchema = z.object({
  name: z.object({
    ar: z.string().min(1, 'Arabic name is required'),
    en: z.string().optional(),
  }),
  description: z
    .object({
      ar: z.string().optional(),
      en: z.string().optional(),
    })
    .optional(),
  image: z.instanceof(File).optional().or(z.literal('')).or(z.null()),
  points_required: z.coerce.number().min(1, 'Points required must be at least 1'),
  stock_quantity: z.coerce.number().min(0).optional(),
  is_active: z.boolean(),
  category_id: z.coerce.number().optional(),
  terms_conditions: z
    .object({
      ar: z.string().optional(),
      en: z.string().optional(),
    })
    .optional(),
});

export type GiftFormValues = z.infer<typeof GiftSchema>;
