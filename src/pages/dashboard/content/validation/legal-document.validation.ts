import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const LegalDocumentSchema = z.object({
  title: z.object({
    en: z.string().min(1, t('legalDocument.titleEnRequired')),
    ar: z.string().min(1, t('legalDocument.titleArRequired')),
  }),
  content: z.object({
    en: z.string().min(1, t('legalDocument.contentEnRequired')),
    ar: z.string().min(1, t('legalDocument.contentArRequired')),
  }),
});

export type LegalDocumentFormValues = z.infer<typeof LegalDocumentSchema>;
