import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const SectionSchema = zod.object({
  /** `manual` = hand-picked items, `api` = automatic feed with filters. */
  type: zod.enum(['manual', 'api']),
  content_type: zod.string().min(1, { message: t('section.contentTypeRequired') }),
  name: zod.object({
    en: zod.string().min(1, { message: t('section.nameEnRequired') }),
    ar: zod.string().min(1, { message: t('section.nameArRequired') }),
  }),
  /** Section arrangement: slider | list | grid. */
  layout: zod.enum(['slider', 'list', 'grid']).optional(),
  /** Card shape inside the section: horizontal | vertical | square. */
  variant: zod.enum(['horizontal', 'vertical', 'square']).optional(),
  background_color: zod.string().optional(),
  background_card_color: zod.string().optional(),
});

export type SectionFormValues = zod.infer<typeof SectionSchema>;
