import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const BrandSchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: t('brand.nameEnRequired') }),
    ar: zod.string().min(1, { message: t('brand.nameArRequired') }),
  }),
  image: zod.instanceof(File).optional().or(zod.literal('')).or(zod.null()),
});

export type BrandFormValues = zod.infer<typeof BrandSchema>;
