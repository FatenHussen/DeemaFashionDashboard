import { z as zod } from 'zod';

// ----------------------------------------------------------------------

export const CitySchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: 'English name is required!' }),
    ar: zod.string().min(1, { message: 'Arabic name is required!' }),
  }),
  governorate_id: zod.number().min(1, { message: 'Governorate is required!' }),
});

export type CityFormValues = zod.infer<typeof CitySchema>;
