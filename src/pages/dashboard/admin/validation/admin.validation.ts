import { z as zod } from 'zod';

// ----------------------------------------------------------------------

export const AdminSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(6, { message: 'Password must be at least 6 characters!' })
    .optional()
    .or(zod.literal('')),
});

export type AdminFormValues = zod.infer<typeof AdminSchema>;
