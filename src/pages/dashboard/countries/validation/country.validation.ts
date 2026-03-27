import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const CountrySchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: t('country.nameEnRequired') }),
    ar: zod.string().min(1, { message: t('country.nameArRequired') }),
  }),
  code: zod.string().min(1, { message: t('country.codeRequired') }).max(12, { message: t('country.codeMax') }),
  /** Hidden from UI; kept true for API payloads */
  is_active: zod.boolean(),
});

export type CountryFormValues = zod.infer<typeof CountrySchema>;
