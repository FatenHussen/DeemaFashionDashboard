import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const ServiceSchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: t('service.nameEnRequired') }),
    ar: zod.string().min(1, { message: t('service.nameArRequired') }),
  }),
});

export type ServiceFormValues = zod.infer<typeof ServiceSchema>;
