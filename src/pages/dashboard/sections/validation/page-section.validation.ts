import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const PageSectionSchema = z.object({
  name: z.object({
    en: z.string().min(1, t('pageSection.nameEnRequired')),
    ar: z.string().min(1, t('pageSection.nameArRequired')),
  }),
  section_id: z.union([z.string(), z.number()]).refine(
    (val) => {
      if (typeof val === 'string') return val !== '';
      if (typeof val === 'number') return val > 0;
      return false;
    },
    { message: t('pageSection.sectionRequired') }
  ),
  page_id: z.union([z.string(), z.number()]).refine(
    (val) => {
      if (typeof val === 'string') return val !== '';
      if (typeof val === 'number') return val > 0;
      return false;
    },
    { message: t('pageSection.pageRequired') }
  ),
  display_type_id: z.union([z.string(), z.number()]).refine(
    (val) => {
      if (typeof val === 'string') return val !== '';
      if (typeof val === 'number') return val > 0;
      return false;
    },
    { message: t('pageSection.displayTypeRequired') }
  ),
  position: z.enum(['before', 'after'], {
    required_error: t('pageSection.positionRequired'),
  }),
  variant: z.enum(['vertical', 'horizontal', 'square'], {
    required_error: t('pageSection.variantRequired'),
  }),
  order: z.union([z.string(), z.number()]),
  background_color: z.string().optional(),
  background_card_color: z.string().optional(),
  filters: z.record(z.any()).optional(),
});

export type PageSectionFormValues = z.infer<typeof PageSectionSchema>;
