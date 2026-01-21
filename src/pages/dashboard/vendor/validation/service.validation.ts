import { z as zod } from 'zod';

// ----------------------------------------------------------------------

export const ServiceSchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: 'English name is required!' }),
    ar: zod.string().min(1, { message: 'Arabic name is required!' }),
  }),
});

export type ServiceFormValues = zod.infer<typeof ServiceSchema>;
