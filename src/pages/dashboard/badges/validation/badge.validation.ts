import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

export const BadgeSchema = z.object({
  name: z.object({
    en: z.string().optional().default(''),
    ar: z.string().optional().default(''),
  }),
  color: z.string().optional().default(''),
  position: z.enum(['top', 'bottom'], { required_error: t('badge.positionRequired') }),
  image: z
    .instanceof(File)
    .nullable()
    .optional()
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      t('badge.imageFormat')
    ),
});

export type BadgeFormValues = z.infer<typeof BadgeSchema>;
