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

/** Operational status — solid fills (high contrast on table rows), distinct from account Active. */
export const DRIVER_AVAILABILITY_BADGE: Record<
  DriverAvailabilityKey,
  { className: string; iconClassName: string }
> = {
  available: {
    className:
      'inline-flex items-center gap-1.5 rounded-full border-2 border-sky-800 bg-sky-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm',
    iconClassName: 'text-white',
  },
  busy: {
    className:
      'inline-flex items-center gap-1.5 rounded-full border-2 border-amber-800 bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm',
    iconClassName: 'text-white',
  },
  inactive: {
    className:
      'inline-flex items-center gap-1.5 rounded-full border-2 border-slate-700 bg-slate-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm',
    iconClassName: 'text-white',
  },
};

/** Account enabled — high contrast vs operational status column. */
export const DRIVER_ACCOUNT_ACTIVE_BADGE = {
  active:
    'inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-800 bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm',
  inactive:
    'inline-flex items-center gap-1.5 rounded-full border-2 border-rose-800 bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm',
} as const;
