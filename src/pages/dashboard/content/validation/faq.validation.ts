import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const FaqSchema = z.object({
  question: z.object({
    en: z.string().min(1, t('faq.questionEnRequired')),
    ar: z.string().min(1, t('faq.questionArRequired')),
  }),
  answer: z.object({
    en: z.string().min(1, t('faq.answerEnRequired')),
    ar: z.string().min(1, t('faq.answerArRequired')),
  }),
  type: z.string().min(1, t('faq.typeRequired')),
});

export type FaqFormValues = z.infer<typeof FaqSchema>;
