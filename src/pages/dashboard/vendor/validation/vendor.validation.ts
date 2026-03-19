import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

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
    .regex(/^\+?[1-9]\d{1,14}$/, { message: t('vendor.invalidPhoneFormat') }),
  commercial_register: zod.string().min(1, { message: t('vendor.commercialRegisterRequired') }),
  contract_date: zod.string().min(1, { message: t('vendor.contractDateRequired') }),
  contract_number: zod.string().min(1, { message: t('vendor.contractNumberRequired') }),
  contract_duration_months: zod
    .number()
    .min(1, { message: t('vendor.contractDurationMin') }),
  commission_rate: zod
    .number()
    .min(0, { message: t('vendor.commissionRateMin') })
    .max(100, { message: t('vendor.commissionRateMax') }),
  is_active: zod.boolean(),
});

export type VendorFormValues = zod.infer<typeof VendorSchema>;
