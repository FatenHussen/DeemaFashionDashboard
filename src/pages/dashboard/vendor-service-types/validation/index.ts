import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const VendorServiceTypeSchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: t('nameEnRequired') }),
    ar: zod.string().min(1, { message: t('nameArRequired') }),
  }),
  is_active: zod.boolean(),
});

export type VendorServiceTypeFormValues = zod.infer<typeof VendorServiceTypeSchema>;
