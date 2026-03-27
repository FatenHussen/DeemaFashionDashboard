import type { TFunction } from 'i18next';
import type { NotificationType } from '@/pages/dashboard/admin-notifications/types/notification.types';

const TYPE_KEYS: Record<NotificationType, string> = {
  all: 'form.notificationAudienceAll',
  user: 'form.notificationAudienceUser',
  driver: 'form.notificationAudienceDriver',
  vendor: 'form.notificationAudienceVendor',
};

export function notificationTypeLabel(type: string, t: TFunction<'table'>): string {
  if (type in TYPE_KEYS) return t(TYPE_KEYS[type as NotificationType] as 'form.notificationAudienceAll');
  return type;
}
