/**
 * Permission helper functions
 *
 * These functions safely check if a user has required permissions.
 * They return false if permissions are undefined or null.
 */

/** Normalize a permission value to string (handles `{ name: "warranty.view" }`). */
export function toPermissionString(p: unknown): string | null {
  if (typeof p === 'string' && p.trim()) return p.trim();
  if (p && typeof p === 'object' && typeof (p as { name?: unknown }).name === 'string') {
    const name = (p as { name: string }).name.trim();
    return name || null;
  }
  return null;
}

export function asPermissionStrings(permissions: unknown): string[] {
  if (!Array.isArray(permissions)) return [];
  const out: string[] = [];
  for (const p of permissions) {
    const s = toPermissionString(p);
    if (s) out.push(s);
  }
  return out;
}

/**
 * Check if user has a specific permission
 * @param permissions - Array of permission strings (e.g., ["vendor.view", "vendor.create"])
 * @param permission - Permission to check (e.g., "vendor.view")
 * @returns true if user has the permission, false otherwise
 */
export function can(permissions: string[] | undefined | null, permission: string): boolean {
  return asPermissionStrings(permissions).includes(permission);
}

/**
 * Check if user has ANY of the specified permissions
 * @param permissions - Array of permission strings
 * @param permissionList - Array of permissions to check (OR logic)
 * @returns true if user has at least one of the permissions, false otherwise
 */
export function canAny(
  permissions: string[] | undefined | null,
  permissionList: string[]
): boolean {
  if (!permissionList || permissionList.length === 0) {
    return false;
  }
  const list = asPermissionStrings(permissions);
  return permissionList.some((perm) => list.includes(perm));
}

/**
 * Check if user has ALL of the specified permissions
 * @param permissions - Array of permission strings
 * @param permissionList - Array of permissions to check (AND logic)
 * @returns true if user has all of the permissions, false otherwise
 */
export function canAll(
  permissions: string[] | undefined | null,
  permissionList: string[]
): boolean {
  if (!permissionList || permissionList.length === 0) {
    return false;
  }
  const list = asPermissionStrings(permissions);
  return permissionList.every((perm) => list.includes(perm));
}

