import { z as zod } from 'zod';

// ----------------------------------------------------------------------

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const bilingualSchema = (arMsg: string, enMsg: string) =>
  zod.object({
    ar: zod.string().min(1, { message: arMsg }),
    en: zod.string().min(1, { message: enMsg }),
  });

const DayScheduleSchema = zod.object({
  open: zod.string().optional(),
  close: zod.string().optional(),
  closed: zod.coerce.boolean().optional(),
});

const WorkingHoursSchema = zod.object({
  monday: DayScheduleSchema.optional(),
  tuesday: DayScheduleSchema.optional(),
  wednesday: DayScheduleSchema.optional(),
  thursday: DayScheduleSchema.optional(),
  friday: DayScheduleSchema.optional(),
  saturday: DayScheduleSchema.optional(),
  sunday: DayScheduleSchema.optional(),
});

export const ShopSchema = zod.object({
  vendor_id: zod.number().min(1, { message: 'Vendor is required!' }),
  logo: zod
    .instanceof(File)
    .nullable()
    .optional()
    .refine((file) => {
      if (file === null || file === undefined) return true;
      return file.size <= MAX_FILE_SIZE;
    }, 'Logo must be less than 2MB')
    .refine((file) => {
      if (file === null || file === undefined) return true;
      return ACCEPTED_IMAGE_TYPES.includes(file.type);
    }, 'Logo must be JPEG, PNG, GIF or WebP'),
  name: bilingualSchema('Arabic name is required!', 'English name is required!'),
  description: bilingualSchema('Arabic description is required!', 'English description is required!'),
  address: bilingualSchema('Arabic address is required!', 'English address is required!'),
  lat: zod.coerce.number({ required_error: 'Latitude is required!' }),
  lng: zod.coerce.number({ required_error: 'Longitude is required!' }),
  phone: zod.string().min(1, { message: 'Phone is required!' }),
  mobile: zod
    .string()
    .min(1, { message: 'Mobile is required!' })
    .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid mobile number format!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  working_hours: WorkingHoursSchema,
  is_active: zod.boolean(),
  area_id: zod.number().min(1, { message: 'Area is required!' }),
  service_ids: zod
    .array(zod.object({ id: zod.number() }))
    .min(1, { message: 'At least one service is required!' }),
});

export type ShopFormValues = zod.infer<typeof ShopSchema>;

