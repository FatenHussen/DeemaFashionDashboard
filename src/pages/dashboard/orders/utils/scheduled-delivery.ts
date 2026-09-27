const SCHEDULED_DELIVERY_RE = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})/;

/** Display `scheduled_delivery_at` as `Y-m-d H:i`. Null stays empty — never filled from product `delivery_time`. */
export function formatScheduledDeliveryAt(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const value = String(raw).trim();
  if (!value) return null;
  const match = value.match(SCHEDULED_DELIVERY_RE);
  if (!match) return value;
  return `${match[1]} ${match[2]}:${match[3]}`;
}

export function splitScheduledDeliveryAt(raw: string | null | undefined): {
  date: string;
  time: string;
} {
  const formatted = formatScheduledDeliveryAt(raw);
  if (!formatted) return { date: '', time: '' };
  const match = formatted.match(SCHEDULED_DELIVERY_RE);
  if (!match) return { date: '', time: '' };
  return { date: match[1], time: `${match[2]}:${match[3]}` };
}

/** Empty date and time clear the appointment. A half-filled form is incomplete. */
export function buildScheduledDeliveryAt(date: string, time: string): string | null | 'incomplete' {
  const day = date.trim();
  const clock = time.trim().slice(0, 5);
  if (!day && !clock) return null;
  if (!day || !clock) return 'incomplete';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^\d{2}:\d{2}$/.test(clock)) return 'incomplete';
  return `${day} ${clock}`;
}

export function readInstantDeliveryFlag(value: unknown): boolean | null {
  if (value === true || value === 1 || value === '1') return true;
  if (value === false || value === 0 || value === '0') return false;
  return null;
}
