import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

function normalizeMaxDistance(val: unknown): number | null {
  if (val === '' || val === undefined || val === null) return null;
  if (typeof val === 'number') return Number.isNaN(val) ? null : val;
  const n = Number(String(val).trim());
  return Number.isNaN(n) ? null : n;
}

export const DeliveryDistanceRangeFormSchema = z
  .object({
    min_distance: z.coerce.number().min(0, t('deliveryDistanceRange.minNonNegative')),
    max_distance: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .transform(normalizeMaxDistance),
    multiplier: z.coerce.number().gt(0, t('deliveryDistanceRange.multiplierPositive')),
  })
  .superRefine((data, ctx) => {
    if (data.max_distance !== null && data.max_distance <= data.min_distance) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['max_distance'],
        message: t('deliveryDistanceRange.maxGreaterThanMin'),
      });
    }
  });

export type DeliveryDistanceRangeFormValues = z.infer<typeof DeliveryDistanceRangeFormSchema>;
