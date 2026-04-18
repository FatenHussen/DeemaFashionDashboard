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
  commission_type: zod.enum(['percentage', 'fixed']),
  settlement_cycle: zod.enum(['weekly', 'monthly']),
  fixed_commission: zod.coerce.number({ invalid_type_error: t('vendor.fixedCommissionMin') }).optional(),
  is_active: zod.boolean(),
})
  .superRefine((data, ctx) => {
    if (data.commission_type === 'fixed') {
      const f = data.fixed_commission;
      if (f === undefined || f === null || Number.isNaN(f)) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          path: ['fixed_commission'],
          message: t('vendor.fixedCommissionRequired'),
        });
      } else if (f < 0) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          path: ['fixed_commission'],
          message: t('vendor.fixedCommissionMin'),
        });
      }
    }
  });

export type VendorFormValues = zod.infer<typeof VendorSchema>;
