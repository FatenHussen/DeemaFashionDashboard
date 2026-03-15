// ----------------------------------------------------------------------

/**
 * Safely converts unknown values (including API objects like {type, value, attribute})
 * to a displayable string for React children.
 */
export function toDisplayString(val: unknown): string {
  if (val == null) return '-';
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean')
    return String(val);
  if (typeof val === 'object') {
    const o = val as Record<string, unknown>;
    if ('value' in o) return String(o.value ?? '-');
    return JSON.stringify(val);
  }
  return String(val);
}
