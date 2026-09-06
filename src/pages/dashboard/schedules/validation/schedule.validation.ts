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
    description: zod
      .object({
        en: zod.string().optional().default(''),
        ar: zod.string().optional().default(''),
      })
      .optional(),
    interval_days: zod.coerce.number().min(1, { message: t('schedule.intervalDaysRequired') }),
    is_active: zod.boolean(),
    discount_type: zod.enum(['percentage', 'fixed']).nullable().optional(),
    discount_value: zod.preprocess((v) => {
      if (v === '' || v === undefined || v === null) return null;
      const n = typeof v === 'number' ? v : Number(v);
      return Number.isFinite(n) ? n : v;
    }, zod.number().min(0).nullable().optional()),
    image: zod.instanceof(File).optional().or(zod.literal('')).or(zod.null()),
    images: zod.array(zod.instanceof(File)).optional().default([]),
    deleted_image_ids: zod.array(zod.coerce.number()).optional().default([]),
    badges: zod
      .array(
        zod.object({
          id: zod.coerce.number().int().positive(),
          position: zod.enum(['top', 'bottom']),
        })
      )
      .optional()
      .default([]),
  })
  .superRefine((data, ctx) => {
    issueIfPercentageDiscountOver100(ctx, data.discount_type ?? undefined, data.discount_value, [
      'discount_value',
    ]);
  });

export type ScheduleFormValues = zod.infer<typeof ScheduleSchema>;
