import { z as zod } from 'zod';

// ----------------------------------------------------------------------

export const CategorySchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: 'English name is required!' }),
    ar: zod.string().min(1, { message: 'Arabic name is required!' }),
  }),
  description: zod.object({
    en: zod.string().min(1, { message: 'English description is required!' }),
    ar: zod.string().min(1, { message: 'Arabic description is required!' }),
  }),
  icon: zod.instanceof(File).optional().or(zod.literal('')).or(zod.null()),
  parent_id: zod.number().nullable().optional(),
});

export type CategoryFormValues = zod.infer<typeof CategorySchema>;

