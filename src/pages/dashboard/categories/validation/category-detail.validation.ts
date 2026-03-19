import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const CategoryDetailSchema = zod.object({
  category_id: zod.number().min(1, { message: t('categoryDetail.categoryRequired') }),
  name: zod.object({
    en: zod.string().min(1, { message: t('categoryDetail.nameEnRequired') }),
    ar: zod.string().min(1, { message: t('categoryDetail.nameArRequired') }),
  }),
});

export type CategoryDetailFormValues = zod.infer<typeof CategoryDetailSchema>;
