import { z } from 'zod';

export const SubscriptionSchema = z.object({
  user_id: z.coerce.number().min(1, 'User is required'),
  package_id: z.coerce.number().min(1, 'Package is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  status: z.string().min(1, 'Status is required'),
  is_active: z.boolean(),
});

export type SubscriptionFormValues = z.infer<typeof SubscriptionSchema>;
