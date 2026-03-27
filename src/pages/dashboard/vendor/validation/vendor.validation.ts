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

function isValidOwnerPhone(value: string) {
  const { e164Prefix, digits } = normalizePhoneDigits(value);
  if (!digits.length) return false;
  // E.164: country code must not start with 0; 7–15 digits after +
  if (e164Prefix) {
    return digits.length >= 7 && digits.length <= 15 && digits[0] !== '0';
  }
  // Local / national: allow leading 0 (e.g. 09xxxxxxxx), 7–15 digits total
  return digits.length >= 7 && digits.length <= 15 && /^\d+$/.test(digits);
}

// ----------------------------------------------------------------------

export const VendorSchema = zod.object({
  name: zod.object({
    ar: zod.string().min(1, { message: t('vendor.nameArRequired') }),
    en: zod.string().min(1, { message: t('vendor.nameEnRequired') }),
  }),
  owner_name: zod.string().min(1, { message: t('vendor.ownerNameRequired') }),
  owner_phone: zod
    .string()
    .min(1, { message: t('vendor.ownerPhoneRequired') })
    .refine(isValidOwnerPhone, { message: t('vendor.invalidPhoneFormat') }),
  commercial_register: zod.string().min(1, { message: t('vendor.commercialRegisterRequired') }),
  contract_date: zod.string().min(1, { message: t('vendor.contractDateRequired') }),
  contract_number: zod.string().min(1, { message: t('vendor.contractNumberRequired') }),
  contract_duration_months: zod.coerce
    .number({ invalid_type_error: t('vendor.contractDurationMin') })
    .min(1, { message: t('vendor.contractDurationMin') }),
  commission_rate: zod.coerce
    .number({ invalid_type_error: t('vendor.commissionRateMin') })
    .min(0, { message: t('vendor.commissionRateMin') })
    .max(100, { message: t('vendor.commissionRateMax') }),
  is_active: zod.boolean(),
});

export type VendorFormValues = zod.infer<typeof VendorSchema>;
