import { z as zod } from 'zod';

// ----------------------------------------------------------------------

export const AreaSchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: 'English name is required!' }),
    ar: zod.string().min(1, { message: 'Arabic name is required!' }),
  }),
  city_id: zod.number().min(1, { message: 'City is required!' }),
  lat: zod.string().optional().default(''),
  lng: zod.string().optional().default(''),
  base_fee: zod.string().optional().default(''),
});

export type AreaFormValues = zod.infer<typeof AreaSchema>;

