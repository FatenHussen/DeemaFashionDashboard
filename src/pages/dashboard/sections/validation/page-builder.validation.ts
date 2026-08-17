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

export const UnifiedSectionSchema = z
  .object({
    type: z.enum(['manual', 'api'], { required_error: t('pageBuilder.typeRequired') }),
    name: z.object({
      en: z.string(),
      ar: z.string(),
    }),
    manual_model: z.string().optional(),
    api_method: z.string().optional(),
    position: z.enum(['before', 'after']),
    variant: z.enum(['horizontal', 'vertical', 'square']),
    order: z.union([z.string(), z.number()]).optional(),
    background_color: z.string().optional(),
    background_card_color: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.type === 'manual' && !values.manual_model) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['manual_model'],
        message: t('pageBuilder.manualModelRequired'),
      });
    }
    if (values.type === 'api' && !values.api_method) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['api_method'],
        message: t('pageBuilder.apiMethodRequired'),
      });
    }
  });

export type UnifiedSectionFormValues = z.infer<typeof UnifiedSectionSchema>;
