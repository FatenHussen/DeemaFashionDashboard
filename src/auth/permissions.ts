/**
 * Permission helper functions
 * 
 * These functions safely check if a user has required permissions.
 * They return false if permissions are undefined or null.
 */

/**
 * Check if user has a specific permission
 * @param permissions - Array of permission strings (e.g., ["vendor.view", "vendor.create"])
 * @param permission - Permission to check (e.g., "vendor.view")
 * @returns true if user has the permission, false otherwise
 */
export function can(permissions: string[] | undefined | null, permission: string): boolean {
  if (!permissions || !Array.isArray(permissions)) {
    return false;
  }
  return permissions.includes(permission);
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
  if (!permissions || !Array.isArray(permissions) || !permissionList || permissionList.length === 0) {
    return false;
  }
  return permissionList.some((perm) => permissions.includes(perm));
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
  if (!permissions || !Array.isArray(permissions) || !permissionList || permissionList.length === 0) {
    return false;
  }
  return permissionList.every((perm) => permissions.includes(perm));
}

