import { z as zod } from 'zod';

// ----------------------------------------------------------------------

export const CategoryDetailSchema = zod.object({
  category_id: zod.number().min(1, { message: 'Category is required!' }),
  name: zod.object({
    en: zod.string().min(1, { message: 'English name is required!' }),
    ar: zod.string().min(1, { message: 'Arabic name is required!' }),
  }),
});

export type CategoryDetailFormValues = zod.infer<typeof CategoryDetailSchema>;
