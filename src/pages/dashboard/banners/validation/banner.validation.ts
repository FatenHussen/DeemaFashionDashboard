import { z as zod } from 'zod';

// ----------------------------------------------------------------------

export const BannerUpdateSchema = zod.object({
  title: zod.object({
    en: zod.string().min(1, { message: 'English title is required!' }),
    ar: zod.string().default(''),
  }),
  description: zod.string().default(''),
  image: zod.instanceof(File).optional().or(zod.null()),
  link: zod.union([zod.string().url(), zod.literal('')]).optional().default(''),
});

export type BannerUpdateFormValues = zod.infer<typeof BannerUpdateSchema>;
