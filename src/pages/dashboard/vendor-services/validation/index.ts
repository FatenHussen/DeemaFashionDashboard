import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const VendorServiceSchema = zod.object({
  vendor_service_type_id: zod.coerce
    .number({ required_error: t('typeRequired') })
    .min(1, { message: t('typeRequired') }),
  name: zod.object({
    en: zod.string().min(1, { message: t('nameEnRequired') }),
    ar: zod.string().min(1, { message: t('nameArRequired') }),
  }),
  description: zod
    .object({
      en: zod.string().optional(),
      ar: zod.string().optional(),
    })
    .optional(),
  is_active: zod.boolean().default(true),
});

export type VendorServiceFormValues = zod.infer<typeof VendorServiceSchema>;
