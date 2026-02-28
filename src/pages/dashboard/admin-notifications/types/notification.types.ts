// ── Admin Notification types ──────────────────────────────────────────

export const NOTIFICATION_TYPES = ['all', 'user', 'driver', 'vendor'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// ── List response  GET /admin/notifications ───────────────────────────

export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  type: NotificationType;
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

// ── Create payload  POST /admin/notifications ──────────────────────────

export interface NotificationCreatePayload {
  title: string;
  body: string;
  type: NotificationType;
}
