import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const UnitSchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: t('unit.nameEnRequired') }),
    ar: zod.string().min(1, { message: t('unit.nameArRequired') }),
  }),
  is_active: zod.boolean(),
});

export type UnitFormValues = zod.infer<typeof UnitSchema>;
