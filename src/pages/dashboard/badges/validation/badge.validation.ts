import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const BadgeSchema = z.object({
  name: z.object({
    en: z.string().min(1, t('badge.nameEnRequired')),
    ar: z.string().min(1, t('badge.nameArRequired')),
  }),
  color: z.string().min(1, t('badge.colorRequired')).regex(/^#[0-9A-Fa-f]{6}$/, t('badge.hexColorInvalid')),
});

export type BadgeFormValues = z.infer<typeof BadgeSchema>;
