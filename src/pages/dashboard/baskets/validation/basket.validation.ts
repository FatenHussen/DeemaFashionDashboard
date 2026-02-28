import { z } from 'zod';

export const BasketSchema = z.object({
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
});

export type BasketFormValues = z.infer<typeof BasketSchema>;
