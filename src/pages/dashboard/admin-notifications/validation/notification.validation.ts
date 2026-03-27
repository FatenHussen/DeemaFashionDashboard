import { z } from 'zod';

import i18n from 'src/lib/i18n';

import { NOTIFICATION_TYPES } from '../types/notification.types';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const NotificationSchema = z.object({
  title: z.string().min(1, t('notification.titleRequired')),
  body: z.string().min(1, t('notification.bodyRequired')),
  type: z.enum(NOTIFICATION_TYPES, {
    required_error: t('notification.typeRequired'),
    invalid_type_error: t('notification.typeInvalid'),
  }),
  is_fixed: z.boolean().default(false),
});

export type NotificationFormValues = z.infer<typeof NotificationSchema>;
