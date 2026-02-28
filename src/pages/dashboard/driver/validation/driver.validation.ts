import { z as zod } from 'zod';

// ----------------------------------------------------------------------

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const baseDriverSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  phone: zod.string().min(1, { message: 'Phone is required!' }),
  address: zod.string().min(1, { message: 'Address is required!' }),
  area_ids: zod
    .array(
      zod.object({
        id: zod.number(),
      })
    )
    .min(1, { message: 'At least one area is required!' }),
  rate_per_order: zod.union([zod.string(), zod.number()]).optional(),
  vehicle_type: zod.string().optional(),
  vehicle_number: zod.string().min(1, { message: 'Vehicle number is required!' }),
  image: zod
    .instanceof(File)
    .nullable()
    .optional()
    .refine((file) => {
      if (file === null || file === undefined) return true;
      return file.size <= MAX_FILE_SIZE;
    }, 'Image must be less than 2MB')
    .refine((file) => {
      if (file === null || file === undefined) return true;
      return ACCEPTED_IMAGE_TYPES.includes(file.type);
    }, 'Image must be JPEG, PNG, GIF or WebP'),
});

export const DriverSchema = baseDriverSchema.extend({
  password: zod
    .string()
    .min(8, { message: 'Password must be at least 8 characters!' })
    .optional()
    .or(zod.literal('')),
});

export const DriverCreateSchema = baseDriverSchema.extend({
  password: zod.string().min(8, { message: 'Password is required! (min 8 characters)' }),
});

export const DriverUpdateSchema = baseDriverSchema.extend({
  password: zod
    .string()
    .min(8, { message: 'Password must be at least 8 characters!' })
    .optional()
    .or(zod.literal('')),
});

export type DriverFormValues = zod.infer<typeof DriverSchema>;

