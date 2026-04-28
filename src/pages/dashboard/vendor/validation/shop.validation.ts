import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

function normalizePhoneDigits(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith('+')) {
    return { e164Prefix: true, digits: trimmed.slice(1).replace(/\D/g, '') };
  }
  return { e164Prefix: false, digits: trimmed.replace(/\D/g, '') };
}

function isValidShopMobile(value: string) {
  const { e164Prefix, digits } = normalizePhoneDigits(value);
  if (!digits.length) return false;
  if (e164Prefix) {
    return digits.length >= 7 && digits.length <= 15 && digits[0] !== '0';
  }
  return digits.length >= 7 && digits.length <= 15 && /^\d+$/.test(digits);
}

// ----------------------------------------------------------------------

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const bilingualSchema = (arMsg: string, enMsg: string) =>
  zod.object({
    ar: zod.string().min(1, { message: arMsg }),
    en: zod.string().min(1, { message: enMsg }),
  });

const optionalBilingualSchema = () =>
  zod.object({
    ar: zod.string().optional().default(''),
    en: zod.string().optional().default(''),
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
  vendor_id: zod.coerce.number().min(1, { message: t('shop.vendorRequired') }),
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
  address: optionalBilingualSchema(),
  lat: zod.preprocess(
    (v) =>
      v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? undefined : v,
    zod.coerce.number().optional()
  ),
  lng: zod.preprocess(
    (v) =>
      v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? undefined : v,
    zod.coerce.number().optional()
  ),
  phone: zod.string().default(''),
  mobile: zod
    .string()
    .default('')
    .refine((v) => !v?.trim() || isValidShopMobile(v), { message: t('shop.invalidMobileFormat') }),
  email: zod
    .string()
    .default('')
    .refine(
      (v) => v.trim() === '' || zod.string().email().safeParse(v).success,
      { message: t('shop.emailInvalid') }
    ),
  working_hours: WorkingHoursSchema,
  is_active: zod.boolean(),
  area_id: zod.coerce.number().min(0),
  service_ids: zod.array(zod.object({ id: zod.number() })).default([]),
  badges: zod.array(zod.number()).default([]),
  /** UI only; API receives `is_restaurant` (true when restaurant). */
  shop_type: zod.enum(['restaurant', 'service_provider', 'store']),
  payment_methods: zod.array(zod.enum(['cash', 'online'])).default([]),
  pricing_tier: zod.enum(['cheap', 'medium', 'expensive']),
  is_recommended: zod.boolean(),
});

export type ShopFormValues = zod.infer<typeof ShopSchema>;
