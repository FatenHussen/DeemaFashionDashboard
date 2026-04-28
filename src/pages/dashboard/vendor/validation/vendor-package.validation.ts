import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const REPORT_LEVELS = ['basic', 'advanced', 'full'] as const;

export const VendorPackageSchema = z.object({
  name: z.object({
    ar: z.string().min(1, t('vendorPackage.nameArRequired')),
    en: z.string().min(1, t('vendorPackage.nameEnRequired')),
  }),
  description: z.object({
    ar: z.string().default(''),
    en: z.string().default(''),
  }),
  price: z.number().min(0, t('vendorPackage.priceMin')),
  duration_days: z.number().min(1, t('vendorPackage.durationMin')),
  max_products: z.number().min(0, t('vendorPackage.maxProductsMin')),
  commission_rate: z.number().min(0, t('vendorPackage.commissionRateMin')),
  commission_per_order: z.number().min(0, t('vendorPackage.commissionPerOrderMin')),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  has_premium_badge: z.boolean(),
  sort_order: z.number(),
  search_priority: z.number(),
  max_campaigns: z.number().min(0),
  has_banner_ad: z.boolean(),
  has_sales_reports: z.boolean(),
  has_analytics: z.boolean(),
  report_level: z.enum(REPORT_LEVELS),
  order_priority: z.number(),
  can_set_prep_time: z.boolean(),
  custom_shipping_options: z.boolean(),
  has_vendor_delivery: z.boolean(),
  activation_fee_waived: z.boolean(),
});

export type VendorPackageFormValues = z.infer<typeof VendorPackageSchema>;
