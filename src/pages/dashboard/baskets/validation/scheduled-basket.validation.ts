import { z } from 'zod';

export const ScheduledBasketSchema = z.object({
  category_id: z.coerce.number().min(1, 'Category is required'),
  name: z.object({
    en: z.string().min(1, 'English name is required'),
    ar: z.string().min(1, 'Arabic name is required'),
  }),
  offer_ends_at: z.string().optional(),
  discount: z.coerce.number().min(0).optional(),
  discount_type: z.enum(['fixed', 'percentage']),
  delivery_price: z.coerce.number().min(0).optional(),
  image: z.instanceof(File).optional().or(z.literal('')).or(z.null()),
  items: z
    .array(
      z.object({
        shop_product_variant_id: z.coerce.number().min(1, 'Product variant is required'),
        quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'At least one item is required'),
  scheduled_at: z.string().min(1, 'Scheduled date is required'),
  scheduled_end_at: z.string().optional(),
  is_recurring: z.boolean(),
  recurrence_type: z.enum(['daily', 'weekly', 'monthly']).optional(),
  is_active: z.boolean(),
});

export type ScheduledBasketFormValues = z.infer<typeof ScheduledBasketSchema>;
