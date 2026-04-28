import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const BannerUpdateSchema = zod.object({
  title: zod.object({
    en: zod.string().min(1, { message: t('banner.titleEnRequired') }),
    ar: zod.string().default(''),
  }),
  description: zod.object({
    en: zod.string().default(''),
    ar: zod.string().default(''),
  }),
  image: zod.instanceof(File).optional().or(zod.null()),
  link: zod.union([zod.string().url(), zod.literal('')]).optional().default(''),
  expires_at: zod.string().optional().default(''),
});

export type BannerUpdateFormValues = zod.infer<typeof BannerUpdateSchema>;
