import { z } from 'zod';

export const CurrencySchema = z.object({
  code: z.string().length(3, 'Code must be exactly 3 characters'),
  name: z.object({
    en: z.string().min(1, 'English name is required'),
    ar: z.string().min(1, 'Arabic name is required'),
  }),
  symbol: z.string().min(1, 'Symbol is required'),
  exchange_rate: z.coerce.number().min(0.000001, 'Exchange rate must be greater than 0'),
  is_default: z.boolean(),
  is_active: z.boolean(),
});

export type CurrencyFormValues = z.infer<typeof CurrencySchema>;
