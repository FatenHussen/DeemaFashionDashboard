import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const ShopVendorServiceCreateSchema = zod.object({
  shop_id: zod.coerce.number().min(1, { message: t('required') }),
  vendor_service_id: zod.coerce.number().min(1, { message: t('required') }),
  price: zod.coerce.number().min(0, { message: t('positiveNumber') }),
  price_unit: zod.string().optional(),
  duration_minutes: zod.coerce.number().optional(),
  is_active: zod.boolean().default(true),
});

export const ShopVendorServiceUpdateSchema = zod.object({
  price: zod.coerce.number().min(0, { message: t('positiveNumber') }),
  price_unit: zod.string().optional(),
  duration_minutes: zod.coerce.number().optional(),
  is_active: zod.boolean().default(true),
});

export type ShopVendorServiceCreateFormValues = zod.infer<typeof ShopVendorServiceCreateSchema>;
export type ShopVendorServiceUpdateFormValues = zod.infer<typeof ShopVendorServiceUpdateSchema>;
