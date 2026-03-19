import { z as zod } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

// ----------------------------------------------------------------------

export const ScheduleSchema = zod.object({
  name: zod.object({
    en: zod.string().min(1, { message: t('schedule.nameEnRequired') }),
    ar: zod.string().min(1, { message: t('schedule.nameArRequired') }),
  }),
  day: zod.string().min(1, { message: t('schedule.dayRequired') }),
  start_time: zod.string().min(1, { message: t('schedule.startTimeRequired') }),
  end_time: zod.string().min(1, { message: t('schedule.endTimeRequired') }),
  is_active: zod.boolean(),
});

export type ScheduleFormValues = zod.infer<typeof ScheduleSchema>;
