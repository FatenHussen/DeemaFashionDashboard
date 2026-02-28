import { z } from 'zod';

export const LegalDocumentSchema = z.object({
  title: z.object({
    en: z.string().min(1, 'Title (EN) is required'),
    ar: z.string().min(1, 'Title (AR) is required'),
  }),
  content: z.object({
    en: z.string().min(1, 'Content (EN) is required'),
    ar: z.string().min(1, 'Content (AR) is required'),
  }),
});

export type LegalDocumentFormValues = z.infer<typeof LegalDocumentSchema>;
