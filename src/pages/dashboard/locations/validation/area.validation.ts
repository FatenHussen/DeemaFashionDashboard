import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const AreaSchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: t('area.nameEnRequired') }),
    ar: zod.string().min(1, { message: t('area.nameArRequired') }),
  }),
  city_id: zod.number().refine((v) => v > 0, { message: t('area.cityRequired') }),
  lat: zod.string().default(''),
  lng: zod.string().default(''),
  base_fee: zod.string().default(''),
});

export type AreaFormValues = zod.infer<typeof AreaSchema>;
