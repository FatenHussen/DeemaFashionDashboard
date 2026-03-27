import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const CategorySchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: t('category.nameEnRequired') }),
    ar: zod.string().min(1, { message: t('category.nameArRequired') }),
  }),
  icon: zod.instanceof(File).optional().or(zod.literal('')).or(zod.null()),
  parent_id: zod.number().nullable().optional(),
  order: zod.coerce.number().min(0).optional(),
  is_active: zod.boolean(),
});

export type CategoryFormValues = zod.infer<typeof CategorySchema>;
