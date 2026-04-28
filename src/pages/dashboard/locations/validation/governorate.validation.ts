import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const GovernorateSchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: t('governorate.nameEnRequired') }),
    ar: zod.string().min(1, { message: t('governorate.nameArRequired') }),
  }),
});

export type GovernorateFormValues = zod.infer<typeof GovernorateSchema>;
