import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const SectionSchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: t('section.nameEnRequired') }),
    ar: zod.string().min(1, { message: t('section.nameArRequired') }),
  }),
  manual_model: zod.string().min(1, { message: t('section.manualModelRequired') }),
  item_ids: zod.array(
    zod.object({
      item_id: zod.number(),
      link: zod
        .string()
        .max(255, { message: t('section.itemLinkMax') }),
      order: zod.number(),
    })
  ),
});

export type SectionFormValues = zod.infer<typeof SectionSchema>;
