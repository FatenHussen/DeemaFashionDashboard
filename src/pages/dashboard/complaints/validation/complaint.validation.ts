import { z } from 'zod';

import i18n from 'src/lib/i18n';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const ComplaintUpdateSchema = z.object({
  status: z.enum(['rejected', 'resolved']),
  admin_response: z.string().min(1, t('complaint.adminResponseRequired')),
});

export type ComplaintUpdateFormValues = z.infer<typeof ComplaintUpdateSchema>;
