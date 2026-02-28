import { z } from 'zod';

export const FaqSchema = z.object({
  question: z.object({
    en: z.string().min(1, 'Question (EN) is required'),
    ar: z.string().min(1, 'Question (AR) is required'),
  }),
  answer: z.object({
    en: z.string().min(1, 'Answer (EN) is required'),
    ar: z.string().min(1, 'Answer (AR) is required'),
  }),
  type: z.string().min(1, 'Type is required'),
});

export type FaqFormValues = z.infer<typeof FaqSchema>;
