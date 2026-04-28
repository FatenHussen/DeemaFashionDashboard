import { z } from 'zod';

import i18n from 'src/lib/i18n';

import { NOTIFICATION_TYPES, NOTIFICATION_CHANNELS } from '../types/notification.types';

const t = (key: string) => i18n.t(key, { ns: 'validation' });

export const NotificationSchema = z
  .object({
    title: z.string().min(1, t('notification.titleRequired')),
    body: z.string().min(1, t('notification.bodyRequired')),
    types: z
      .array(z.enum(NOTIFICATION_TYPES))
      .min(1, t('notification.typesRequired')),
    channels: z
      .array(z.enum(NOTIFICATION_CHANNELS))
      .min(1, t('notification.channelsRequired')),
    target_page: z.string().optional(),
    emoji: z.string().max(10, t('notification.emojiTooLong')).optional(),
    media: z
      .custom<File>((v) => v instanceof File)
      .nullable()
      .optional(),
    driver_ids: z.array(z.coerce.number().int().positive()).optional(),
    user_ids: z.array(z.coerce.number().int().positive()).optional(),
    vendor_ids: z.array(z.coerce.number().int().positive()).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.types.includes('all') && val.types.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('notification.typesAllExclusive'),
        path: ['types'],
      });
    }
  });

export type NotificationFormValues = z.infer<typeof NotificationSchema>;
