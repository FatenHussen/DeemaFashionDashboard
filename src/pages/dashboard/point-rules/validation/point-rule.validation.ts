import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const PointRuleSchema = zod.object({
  title: zod.object({
    en: zod.string().min(1, { message: t('pointRule.titleEnRequired') }),
    ar: zod.string().min(1, { message: t('pointRule.titleArRequired') }),
  }),
  type: zod.literal('fixed'),
  value: zod.coerce.number().min(1, { message: t('pointRule.valueMin') }),
  min_order_amount: zod.coerce.number().nullable().optional(),
  expires_after_days: zod.coerce.number().min(1, { message: t('pointRule.expiryDaysRequired') }),
  is_active: zod.boolean(),
});

export type PointRuleFormValues = zod.infer<typeof PointRuleSchema>;
