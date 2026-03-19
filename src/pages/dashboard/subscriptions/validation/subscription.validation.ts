import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const SubscriptionSchema = z.object({
  user_id: z.coerce.number().min(1, t('subscription.userRequired')),
  package_id: z.coerce.number().min(1, t('subscription.packageRequired')),
  start_date: z.string().min(1, t('subscription.startDateRequired')),
  end_date: z.string().min(1, t('subscription.endDateRequired')),
  status: z.string().min(1, t('subscription.statusRequired')),
  is_active: z.boolean(),
});

export type SubscriptionFormValues = z.infer<typeof SubscriptionSchema>;
