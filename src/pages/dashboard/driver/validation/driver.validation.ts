import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const baseDriverSchema = zod.object({
  name: zod.string().min(1, { message: t('driver.nameRequired') }),
  phone: zod.string().min(1, { message: t('driver.phoneRequired') }),
  address: zod.string().min(1, { message: t('driver.addressRequired') }),
  area_ids: zod
    .array(
      zod.object({
        id: zod.number(),
      })
    )
    .min(1, { message: t('driver.atLeastOneArea') }),
  rate_per_order: zod.union([zod.string(), zod.number()]).optional(),
  vehicle_type: zod.string().optional(),
  vehicle_number: zod.string().min(1, { message: t('driver.vehicleNumberRequired') }),
  image: zod
    .instanceof(File)
    .nullable()
    .optional()
    .refine((file) => {
      if (file === null || file === undefined) return true;
      return file.size <= MAX_FILE_SIZE;
    }, t('driver.imageMaxSize'))
    .refine((file) => {
      if (file === null || file === undefined) return true;
      return ACCEPTED_IMAGE_TYPES.includes(file.type);
    }, t('driver.imageFormat')),
});

export const DriverSchema = baseDriverSchema.extend({
  password: zod
    .string()
    .min(8, { message: t('driver.passwordMin') })
    .optional()
    .or(zod.literal('')),
});

export const DriverCreateSchema = baseDriverSchema.extend({
  password: zod.string().min(8, { message: t('driver.passwordRequired') }),
});

export const DriverUpdateSchema = baseDriverSchema.extend({
  password: zod
    .string()
    .min(8, { message: t('driver.passwordMin') })
    .optional()
    .or(zod.literal('')),
});

export type DriverFormValues = zod.infer<typeof DriverSchema>;
