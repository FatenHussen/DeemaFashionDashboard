import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const WarrantySchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: t('warranty.nameEnRequired') }),
    ar: zod.string().min(1, { message: t('warranty.nameArRequired') }),
  }),
  description: zod.object({
    en: zod.string(),
    ar: zod.string(),
  }),
  is_active: zod.boolean(),
});

export type WarrantyFormValues = zod.infer<typeof WarrantySchema>;
