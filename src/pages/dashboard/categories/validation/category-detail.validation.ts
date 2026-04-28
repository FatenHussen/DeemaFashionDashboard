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
  value_options: zod
    .array(
      zod.object({
        en: zod.string(),
        ar: zod.string(),
      })
    )
    .superRefine((rows, ctx) => {
      rows.forEach((row, i) => {
        const e = row.en.trim();
        const a = row.ar.trim();
        if (e && !a) {
          ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: t('categoryDetail.valueOptionPairArRequired'),
            path: [i, 'ar'],
          });
        }
        if (a && !e) {
          ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: t('categoryDetail.valueOptionPairEnRequired'),
            path: [i, 'en'],
          });
        }
      });
    }),
});

export type CategoryDetailFormValues = zod.infer<typeof CategoryDetailSchema>;
