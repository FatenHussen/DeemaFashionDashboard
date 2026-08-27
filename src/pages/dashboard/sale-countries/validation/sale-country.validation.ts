import { z } from 'zod';

import i18n from 'src/lib/i18n';

const tv = (key: string) => i18n.t(key, { ns: 'validation' });

export const SaleCountryFormSchema = z.object({
  name: z.object({
    en: z.string().min(1, tv('nameEnRequired')),
    ar: z.string().min(1, tv('nameArRequired')),
  }),
  is_active: z.boolean(),
});

export type SaleCountryFormValues = z.infer<typeof SaleCountryFormSchema>;
