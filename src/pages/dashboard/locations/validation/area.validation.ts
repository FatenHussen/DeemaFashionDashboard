import { z as zod } from 'zod';

// ----------------------------------------------------------------------

export const AreaSchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: 'English name is required!' }),
    ar: zod.string().min(1, { message: 'Arabic name is required!' }),
  }),
  city_id: zod.number().refine((v) => v > 0, { message: 'City is required!' }),
  lat: zod.string().default(''),
  lng: zod.string().default(''),
  base_fee: zod.string().default(''),
});

export type AreaFormValues = zod.infer<typeof AreaSchema>;

