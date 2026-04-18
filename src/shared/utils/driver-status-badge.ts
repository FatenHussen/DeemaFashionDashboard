/**
 * Driver "status" = operational availability (API: available | busy | inactive).
 * Legacy responses may still send "offline" — we normalize that to inactive.
 * "is_active" = account enabled — use separate styles so it is not confused with availability.
 */

export type DriverAvailabilityKey = 'available' | 'busy' | 'inactive';

export function normalizeDriverAvailabilityStatus(raw: string): DriverAvailabilityKey {
  const s = (raw || '').toLowerCase().trim().replace(/\s+/g, '_');
  if (s === 'available') return 'available';
  if (s === 'busy') return 'busy';
  if (s === 'inactive' || s === 'offline') return 'inactive';
  return 'inactive';
}

/** Operational status — distinct palette (sky / amber / slate), not the same as account Active (green). */
export const DRIVER_AVAILABILITY_BADGE: Record<
  DriverAvailabilityKey,
  { className: string; iconClassName: string }
> = {
  available: {
    className:
      'inline-flex items-center gap-1.5 rounded-full border-2 border-sky-600 bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-950 shadow-sm dark:border-sky-500 dark:bg-sky-950/50 dark:text-sky-50',
    iconClassName: 'text-sky-700 dark:text-sky-200',
  },
  busy: {
    className:
      'inline-flex items-center gap-1.5 rounded-full border-2 border-amber-600 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-950 shadow-sm dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-50',
    iconClassName: 'text-amber-800 dark:text-amber-200',
  },
  inactive: {
    className:
      'inline-flex items-center gap-1.5 rounded-full border-2 border-slate-500 bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-sm dark:border-slate-500 dark:bg-slate-800 dark:text-slate-50',
    iconClassName: 'text-slate-700 dark:text-slate-200',
  },
};

/** Account enabled — high contrast vs operational status column. */
export const DRIVER_ACCOUNT_ACTIVE_BADGE = {
  active:
    'inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-800 bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm',
  inactive:
    'inline-flex items-center gap-1.5 rounded-full border-2 border-rose-800 bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm',
} as const;
