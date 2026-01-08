import { z as zod } from 'zod';

// ----------------------------------------------------------------------

export const CategoryAttributeSchema = zod.object({
  category_id: zod.number().min(1, { message: 'Category is required!' }),
  name: zod.object({
    en: zod.string().min(1, { message: 'English name is required!' }),
    ar: zod.string().min(1, { message: 'Arabic name is required!' }),
  }),
  type: zod.string().min(1, { message: 'Type is required!' }),
  values: zod
    .array(
      zod.object({
        name: zod.object({
          en: zod.string().min(1, { message: 'English value name is required!' }),
          ar: zod.string().min(1, { message: 'Arabic value name is required!' }),
        }),
      })
    )
    .min(1, { message: 'At least one value is required!' }),
});

export type CategoryAttributeFormValues = zod.infer<typeof CategoryAttributeSchema>;

