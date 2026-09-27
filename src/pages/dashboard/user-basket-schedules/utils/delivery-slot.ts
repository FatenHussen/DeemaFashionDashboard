import { normalizeIndicNumeralsToLatin } from '@/utils/numeral-locale';

const DATE_ONLY = /^(\d{4}-\d{2}-\d{2})/;
const CLOCK_TIME = /^(\d{1,2}):(\d{2})(?::\d{2})?$/;

function latin(value: string | null | undefined): string {
  return normalizeIndicNumeralsToLatin(value).trim();
}

/** Calendar day from the API (`Y-m-d`). A missing value stays blank — no invented midnight. */
export function formatUserBasketDeliveryDate(value: string | null | undefined): string {
  const raw = latin(value);
  if (!raw) return '—';
  const match = raw.match(DATE_ONLY);
  return match ? match[1] : raw;
}

/**
 * Customer-chosen clock time (`HH:mm`).
 * `null`, empty, and non-time strings render as nothing so they never become `00:00`.
 */
export function formatUserBasketDeliveryTime(value: string | null | undefined): string | null {
  const raw = latin(value);
  if (!raw) return null;
  const match = raw.match(CLOCK_TIME);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours > 23 || minutes > 59) {
    return null;
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Next delivery day, with the same clock time when the customer chose one. */
export function formatUserBasketNextDelivery(
  date: string | null | undefined,
  time: string | null | undefined
): string {
  const day = formatUserBasketDeliveryDate(date);
  const clock = formatUserBasketDeliveryTime(time);
  if (day === '—') return clock ?? '—';
  return clock ? `${day} · ${clock}` : day;
}
