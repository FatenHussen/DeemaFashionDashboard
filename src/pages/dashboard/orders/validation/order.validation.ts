import { z } from 'zod';

export const ChangeOrderStatusSchema = z.object({
  status: z.enum(['pending', 'preparing', 'out_delivery', 'delivered']),
});

export const AssignDriverSchema = z.object({
  driver_id: z.coerce.number().min(1, 'Driver is required'),
});

export type ChangeOrderStatusFormValues = z.infer<typeof ChangeOrderStatusSchema>;
export type AssignDriverFormValues = z.infer<typeof AssignDriverSchema>;
