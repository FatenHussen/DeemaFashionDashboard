import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const ColorFormSchema = z.object({
  name: z.object({
    en: z.string().min(1, t('color.nameEnRequired')),
    ar: z.string().min(1, t('color.nameArRequired')),
  }),
  hex: z
    .string()
    .min(1, t('color.hexRequired'))
    .regex(/^#[0-9A-Fa-f]{6}$/, t('color.hexInvalid')),
  is_active: z.boolean(),
});

export type ColorFormValues = z.infer<typeof ColorFormSchema>;
