// ── Admin Notification types ──────────────────────────────────────────

export const NOTIFICATION_TYPES = ['all', 'user', 'driver', 'vendor'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_CHANNELS = ['fcm', 'sms', 'email'] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

// ── Media shape returned in responses ────────────────────────────────

export interface NotificationMedia {
  type: string;
  url: string;
}

// ── List response  GET /admin/notifications ───────────────────────────

export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  type: NotificationType;
  target_page?: string | null;
  channels: NotificationChannel[];
  emoji?: string | null;
  media?: NotificationMedia | null;
  created_at: string;
}

export interface NotificationListResponse {
  status: boolean;
  message: string;
  data: {
    items: NotificationItem[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface NotificationDetailsResponse {
  status: boolean;
  message: string;
  data: NotificationItem;
}

// ── Create payload  POST /admin/notifications ──────────────────────────

export interface NotificationCreatePayload {
  title: string;
  body: string;
  type: NotificationType;
  channels: NotificationChannel[];
  target_page?: string;
  emoji?: string;
  media?: File | null;
}
