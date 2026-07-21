/**
 * Read a visibility / active flag from API row objects that vary by field name and type.
 */

const ACTIVE_KEYS = ['is_active', 'is_visible', 'visible', 'visibility', 'is_enabled'] as const;

function coerceToBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return undefined;
  }
  if (typeof value === 'string') {
    const s = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on', 'active', 'visible', 'enabled'].includes(s)) return true;
    if (['0', 'false', 'no', 'off', 'inactive', 'hidden', 'disabled'].includes(s)) return false;
    return undefined;
  }
  return undefined;
}

/** Returns undefined when no recognizable active field exists on the row. */
export function readRecordActiveFlag(record: Record<string, unknown>): boolean | undefined {
  for (const key of ACTIVE_KEYS) {
    if (!(key in record)) continue;
    const coerced = coerceToBoolean(record[key]);
    if (coerced !== undefined) return coerced;
  }
  return undefined;
}

export function parseRecordIsActive(record: Record<string, unknown>, fallback = false): boolean {
  return readRecordActiveFlag(record) ?? fallback;
}
