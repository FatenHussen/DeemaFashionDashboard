import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

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
  vendor_id: zod.number().min(1, { message: t('shop.vendorRequired') }),
  logo: zod
    .instanceof(File)
    .nullable()
    .optional()
    .refine((file) => {
      if (file === null || file === undefined) return true;
      return file.size <= MAX_FILE_SIZE;
    }, t('shop.logoMaxSize'))
    .refine((file) => {
      if (file === null || file === undefined) return true;
      return ACCEPTED_IMAGE_TYPES.includes(file.type);
    }, t('shop.logoFormat')),
  name: bilingualSchema(t('shop.nameArRequired'), t('shop.nameEnRequired')),
  description: bilingualSchema(t('shop.descriptionArRequired'), t('shop.descriptionEnRequired')),
  address: bilingualSchema(t('shop.addressArRequired'), t('shop.addressEnRequired')),
  lat: zod.coerce.number({ required_error: t('shop.latRequired') }),
  lng: zod.coerce.number({ required_error: t('shop.lngRequired') }),
  phone: zod.string().min(1, { message: t('shop.phoneRequired') }),
  mobile: zod
    .string()
    .min(1, { message: t('shop.mobileRequired') })
    .regex(/^\+?[1-9]\d{1,14}$/, { message: t('shop.invalidMobileFormat') }),
  email: zod
    .string()
    .min(1, { message: t('shop.emailRequired') })
    .email({ message: t('shop.emailInvalid') }),
  working_hours: WorkingHoursSchema,
  is_active: zod.boolean(),
  area_id: zod.number().min(1, { message: t('shop.areaRequired') }),
  service_ids: zod
    .array(zod.object({ id: zod.number() }))
    .min(1, { message: t('shop.atLeastOneService') }),
});

export type ShopFormValues = zod.infer<typeof ShopSchema>;
