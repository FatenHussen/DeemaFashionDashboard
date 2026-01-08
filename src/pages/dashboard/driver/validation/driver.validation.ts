import { z as zod } from 'zod';

// ----------------------------------------------------------------------

export const DriverSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  phone: zod.string().min(1, { message: 'Phone is required!' }),
  password: zod
    .string()
    .min(6, { message: 'Password must be at least 6 characters!' })
    .optional()
    .or(zod.literal('')),
  address: zod.string().min(1, { message: 'Address is required!' }),
  area_ids: zod
    .array(
      zod.object({
        id: zod.number(),
      })
    )
    .min(1, { message: 'At least one area is required!' }),
});

export type DriverFormValues = zod.infer<typeof DriverSchema>;

