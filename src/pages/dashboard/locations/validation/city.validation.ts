import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const CitySchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: t('city.nameEnRequired') }),
    ar: zod.string().min(1, { message: t('city.nameArRequired') }),
  }),
  governorate_id: zod.number().min(1, { message: t('city.governorateRequired') }),
});

export type CityFormValues = zod.infer<typeof CitySchema>;
