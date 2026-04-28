import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const PackageSchema = z.object({
  name: z.object({
    ar: z.string().min(1, t('package.nameArRequired')),
    en: z.string().min(1, t('package.nameEnRequired')),
  }),
  price: z.coerce.number().min(0, t('package.priceMin')),
  duration_days: z.coerce.number().int(t('package.durationInteger')).min(1, t('package.durationMin')),
  monthly_orders_limit: z.coerce.number().int(t('package.monthlyOrdersLimitInteger')).min(0, t('package.monthlyOrdersLimitMin')),
  free_delivery_count: z.coerce.number().int(t('package.freeDeliveryCountInteger')).min(0, t('package.freeDeliveryCountMin')),
  discount_percentage: z.coerce.number().min(0, t('package.discountMin')).max(100, t('package.discountMax')),
  points_bonus: z.coerce.number().int(t('package.pointsBonusInteger')).min(0, t('package.pointsBonusMin')),
  is_active: z.boolean(),
});

export type PackageFormValues = z.infer<typeof PackageSchema>;
