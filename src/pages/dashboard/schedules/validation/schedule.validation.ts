import { z as zod } from 'zod';

import { issueIfPercentageDiscountOver100 } from 'src/utils/discount-percentage-zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const ScheduleSchema = zod
  .object({
    name: zod.object({
      en: zod.string().min(1, { message: t('schedule.nameEnRequired') }),
      ar: zod.string().min(1, { message: t('schedule.nameArRequired') }),
    }),
    interval_days: zod.coerce.number().min(1, { message: t('schedule.intervalDaysRequired') }),
    is_active: zod.boolean(),
    discount_type: zod.enum(['percentage', 'fixed']).nullable().optional(),
    discount_value: zod.coerce.number().min(0).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    issueIfPercentageDiscountOver100(ctx, data.discount_type ?? undefined, data.discount_value, [
      'discount_value',
    ]);
  });

export type ScheduleFormValues = zod.infer<typeof ScheduleSchema>;
