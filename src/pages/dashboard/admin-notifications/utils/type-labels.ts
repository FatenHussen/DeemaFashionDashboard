import type { TFunction } from 'i18next';
import type { NotificationType } from '@/pages/dashboard/admin-notifications/types/notification.types';

const TYPE_KEYS: Record<NotificationType, string> = {
  all: 'form.notificationAudienceAll',
  user: 'form.notificationAudienceUser',
  driver: 'form.notificationAudienceDriver',
  vendor: 'form.notificationAudienceVendor',
};

export function notificationTypeLabel(type: string, t: TFunction<'table'>): string {
  if (!type) return '—';
  const parts = type
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return '—';
  return parts
    .map((part) =>
      part in TYPE_KEYS
        ? t(TYPE_KEYS[part as NotificationType] as 'form.notificationAudienceAll')
        : part
    )
    .join(', ');
}
