import { z } from 'zod';

export const ComplaintUpdateSchema = z.object({
  status: z.enum(['rejected', 'resolved']),
  admin_response: z.string().min(1, 'Admin response is required'),
});

export type ComplaintUpdateFormValues = z.infer<typeof ComplaintUpdateSchema>;
