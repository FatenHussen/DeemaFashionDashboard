import { z } from 'zod';

export const PackageSchema = z.object({
  name: z.object({
    ar: z.string().min(1, 'Arabic name is required'),
    en: z.string().min(1, 'English name is required'),
  }),
  price: z.coerce.number().min(0, 'Price must be at least 0'),
  duration_days: z.coerce.number().int('Duration must be an integer').min(1, 'Duration must be at least 1 day'),
  monthly_orders_limit: z.coerce.number().int('Monthly orders limit must be an integer').min(0, 'Monthly orders limit must be at least 0'),
  free_delivery_count: z.coerce.number().int('Free delivery count must be an integer').min(0, 'Free delivery count must be at least 0'),
  discount_percentage: z.coerce.number().min(0, 'Discount must be at least 0').max(100, 'Discount cannot exceed 100'),
  points_bonus: z.coerce.number().int('Points bonus must be an integer').min(0, 'Points bonus must be at least 0'),
  is_active: z.boolean(),
});

export type PackageFormValues = z.infer<typeof PackageSchema>;
