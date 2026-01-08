import { z as zod } from 'zod';

// ----------------------------------------------------------------------

export const BrandSchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: 'English name is required!' }),
    ar: zod.string().min(1, { message: 'Arabic name is required!' }),
  }),
  image: zod.instanceof(File).optional().or(zod.literal('')).or(zod.null()),
});

export type BrandFormValues = zod.infer<typeof BrandSchema>;
