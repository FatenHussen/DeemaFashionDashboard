import { z } from 'zod';

import i18n from 'src/lib/i18n';

import { NOTIFICATION_TYPES, NOTIFICATION_CHANNELS } from '../types/notification.types';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const NotificationSchema = z.object({
  title: z.string().min(1, t('notification.titleRequired')),
  body: z.string().min(1, t('notification.bodyRequired')),
  type: z.enum(NOTIFICATION_TYPES, {
    required_error: t('notification.typeRequired'),
    invalid_type_error: t('notification.typeInvalid'),
  }),
  channels: z
    .array(z.enum(NOTIFICATION_CHANNELS))
    .min(1, t('notification.channelsRequired')),
  target_page: z.string().optional(),
  emoji: z.string().max(10, t('notification.emojiTooLong')).optional(),
  media: z
    .custom<File>((v) => v instanceof File)
    .nullable()
    .optional(),
});

export type NotificationFormValues = z.infer<typeof NotificationSchema>;
