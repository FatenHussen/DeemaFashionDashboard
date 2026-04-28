import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const UserPointsAddDeductSchema = z.object({
  points: z.coerce.number().min(1, t('userPoints.pointsMin')),
  reason: z.string().min(1, t('userPoints.reasonRequired')).max(500),
});

export type UserPointsAddDeductFormValues = z.infer<typeof UserPointsAddDeductSchema>;
