import { z } from 'zod';

export const PointExchangeStatusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending'], {
    required_error: 'Status is required',
  }),
});

export type PointExchangeStatusFormValues = z.infer<typeof PointExchangeStatusSchema>;
