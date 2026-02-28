import { z } from 'zod';

import { NOTIFICATION_TYPES } from '../types/notification.types';

export const NotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  type: z.enum(NOTIFICATION_TYPES, {
    required_error: 'Type is required',
    invalid_type_error: 'Type must be all, user, driver, or vendor',
  }),
});

export type NotificationFormValues = z.infer<typeof NotificationSchema>;
