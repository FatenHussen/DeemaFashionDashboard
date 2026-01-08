import { z as zod } from 'zod';

// ----------------------------------------------------------------------

export const VendorSchema = zod.object({
  name: zod.object({
    ar: zod.string().min(1, { message: 'Arabic name is required!' }),
    en: zod.string().min(1, { message: 'English name is required!' }),
  }),
  owner_name: zod.string().min(1, { message: 'Owner name is required!' }),
  owner_phone: zod
    .string()
    .min(1, { message: 'Owner phone is required!' })
    .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format!' }),
  commercial_register: zod.string().min(1, { message: 'Commercial register is required!' }),
  contract_date: zod.string().min(1, { message: 'Contract date is required!' }),
  contract_number: zod.string().min(1, { message: 'Contract number is required!' }),
  contract_duration_months: zod
    .number()
    .min(1, { message: 'Contract duration must be at least 1 month!' }),
  commission_rate: zod
    .number()
    .min(0, { message: 'Commission rate must be 0 or greater!' })
    .max(100, { message: 'Commission rate cannot exceed 100%!' }),
  is_active: zod.boolean(),
});

export type VendorFormValues = zod.infer<typeof VendorSchema>;

