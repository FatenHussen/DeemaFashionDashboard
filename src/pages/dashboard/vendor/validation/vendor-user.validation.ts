import { z } from 'zod';

export const VendorUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().optional(),
  vendor_id: z
    .number({ invalid_type_error: 'Vendor is required' })
    .int()
    .min(1, 'Vendor is required'),
  is_active: z.boolean(),
  shop_ids: z.array(z.number().int()),
});

export type VendorUserFormValues = z.infer<typeof VendorUserSchema>;
