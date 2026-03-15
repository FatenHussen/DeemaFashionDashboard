import { z } from 'zod';

export const VendorUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().optional(),
  vendor_id: z.coerce.number().int().min(1, 'Vendor is required'),
  is_active: z.preprocess(
    (v) => (v === 1 || v === true || v === '1' || v === 'true' ? true : false),
    z.boolean()
  ),
  shop_ids: z.preprocess(
    (val) =>
      Array.isArray(val)
        ? val.map((v) => (typeof v === 'string' ? parseInt(v, 10) : Number(v))).filter((n) => !Number.isNaN(n))
        : [],
    z.array(z.number().int())
  ),
});

export type VendorUserFormValues = z.infer<typeof VendorUserSchema>;
