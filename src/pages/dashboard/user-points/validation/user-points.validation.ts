import { z } from 'zod';

export const UserPointsAddDeductSchema = z.object({
  points: z.coerce.number().min(1, 'Points must be at least 1'),
  reason: z.string().min(1, 'Reason is required').max(500),
});

export type UserPointsAddDeductFormValues = z.infer<typeof UserPointsAddDeductSchema>;
