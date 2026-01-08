import { z as zod } from 'zod';

// ----------------------------------------------------------------------

const DayScheduleSchema = zod.object({
  open: zod.string().optional(),
  close: zod.string().optional(),
  closed: zod.boolean().optional(),
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
  name: zod.object({
    ar: zod.string().min(1, { message: 'Arabic name is required!' }),
    en: zod.string().min(1, { message: 'English name is required!' }),
  }),
  description: zod.object({
    ar: zod.string().min(1, { message: 'Arabic description is required!' }),
    en: zod.string().min(1, { message: 'English description is required!' }),
  }),
  address: zod.object({
    ar: zod.string().min(1, { message: 'Arabic address is required!' }),
    en: zod.string().min(1, { message: 'English address is required!' }),
  }),
  lat: zod.number({ required_error: 'Latitude is required!' }),
  lng: zod.number({ required_error: 'Longitude is required!' }),
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

