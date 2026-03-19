import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const RoleSchema = zod.object({
  name: zod.string().min(1, { message: t('role.nameRequired') }),
  permissions: zod
    .array(
      zod.object({
        id: zod.number(),
      })
    )
    .min(1, { message: t('role.atLeastOnePermission') }),
});

export type RoleFormValues = zod.infer<typeof RoleSchema>;
