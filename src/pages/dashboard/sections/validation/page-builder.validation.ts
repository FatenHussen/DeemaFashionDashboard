import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const PageSchema = z.object({
  title: z.string().trim().min(1, t('pageBuilder.titleRequired')),
  slug: z.string().trim().optional(),
});

export type PageFormValues = z.infer<typeof PageSchema>;

// ----------------------------------------------------------------------

/** Link an existing section to a page. Name/variant/colors copy from the section and can be overridden. */
export const UnifiedSectionSchema = z.object({
  position: z.enum(['before', 'after']),
  layout: z.enum(['slider', 'list', 'grid']),
  variant: z.enum(['horizontal', 'vertical', 'square']),
  order: z.union([z.string(), z.number()]).optional(),
  background_color: z.string().optional(),
  background_card_color: z.string().optional(),
});

export type UnifiedSectionFormValues = z.infer<typeof UnifiedSectionSchema>;
