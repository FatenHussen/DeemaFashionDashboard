import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const IconCreateSchema = z.object({
  name: z.object({
    en: z.string().min(1, t('icon.nameEnRequired')),
    ar: z.string().min(1, t('icon.nameArRequired')),
  }),
  image: z.any().optional().nullable(),
  description: z
    .object({
      en: z.string().max(1000, t('icon.descriptionMax')),
      ar: z.string().max(1000, t('icon.descriptionMax')),
    })
    .optional(),
  full_description: z
    .object({
      en: z.string(),
      ar: z.string(),
    })
    .optional(),
  is_active: z.boolean().optional(),
});

export type IconFormValues = z.infer<typeof IconCreateSchema>;
