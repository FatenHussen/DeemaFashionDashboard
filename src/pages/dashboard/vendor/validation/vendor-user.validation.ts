import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const VendorUserSchema = z.object({
  name: z.string().min(1, t('vendorUser.nameRequired')).max(255),
  email: z.string().min(1, t('vendorUser.emailRequired')).email(t('vendorUser.emailInvalid')),
  password: z.string().optional(),
  vendor_id: z.coerce.number().int().min(1, t('vendorUser.vendorRequired')),
  is_active: z.preprocess(
    (v) => (v === 1 || v === true || v === '1' || v === 'true' ? true : false),
    z.boolean()
  ),
  shop_ids: z.preprocess(
    (val) =>
      Array.isArray(val)
        ? val.map((v) => (typeof v === 'string' ? parseInt(v, 10) : Number(v))).filter((n) => !Number.isNaN(n))
        : [],
    z.array(z.number().int())
  ),
});

export type VendorUserFormValues = z.infer<typeof VendorUserSchema>;
