import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const ScheduleSchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: t('schedule.nameEnRequired') }),
    ar: zod.string().min(1, { message: t('schedule.nameArRequired') }),
  }),
  interval_days: zod.coerce.number().min(1, { message: t('schedule.intervalDaysRequired') }),
  is_active: zod.boolean().default(true),
  discount_type: zod.enum(['percentage', 'fixed']).nullable().optional(),
  discount_value: zod.coerce.number().min(0).nullable().optional(),
});

export type ScheduleFormValues = zod.infer<typeof ScheduleSchema>;
