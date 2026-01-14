import { z as zod } from 'zod';

export const SectionSchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: 'English name is required' }),
    ar: zod.string().min(1, { message: 'Arabic name is required' }),
  }),
  manual_model: zod.string().min(1, { message: 'Manual model is required' }),
  item_ids: zod.array(
    zod.object({
      item_id: zod.number(),
      link: zod.string(),
      order: zod.number(),
    })
  ),
});

export type SectionFormValues = zod.infer<typeof SectionSchema>;
