import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const PointExchangeStatusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending'], {
    required_error: t('pointExchange.statusRequired'),
  }),
});

export type PointExchangeStatusFormValues = z.infer<typeof PointExchangeStatusSchema>;
