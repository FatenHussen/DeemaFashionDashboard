import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const AdminSchema = zod.object({
  name: zod.string().min(1, { message: t('admin.nameRequired') }),
  email: zod
    .string()
    .min(1, { message: t('admin.emailRequired') })
    .email({ message: t('admin.emailInvalid') }),
  password: zod
    .string()
    .min(6, { message: t('admin.passwordMin') })
    .optional()
    .or(zod.literal('')),
  role_ids: zod.array(zod.number()).min(1, { message: t('admin.atLeastOneRole') }),
  city_ids: zod.array(zod.number()),
});

export type AdminFormValues = zod.infer<typeof AdminSchema>;
