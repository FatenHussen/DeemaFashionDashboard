import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const ProductExtraDetailSchema = zod.object({
  category_id: zod.number().min(1, { message: t('productExtraDetail.categoryRequired') }),
  detail_key: zod.object({
    en: zod.string().min(1, { message: t('productExtraDetail.detailKeyEnRequired') }),
    ar: zod.string().min(1, { message: t('productExtraDetail.detailKeyArRequired') }),
  }),
  detail_value: zod.object({
    en: zod.string().min(1, { message: t('productExtraDetail.detailValueEnRequired') }),
    ar: zod.string().min(1, { message: t('productExtraDetail.detailValueArRequired') }),
  }),
  is_active: zod.boolean(),
});

export type ProductExtraDetailFormValues = zod.infer<typeof ProductExtraDetailSchema>;
