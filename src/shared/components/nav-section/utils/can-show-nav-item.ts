import type { NavItemDataProps } from '../types';

// ----------------------------------------------------------------------

/** Check if item should be visible (mirrors NavList permission logic; fail-closed) */
export function canShowNavItem(
  item: NavItemDataProps,
  checkPermissions?: (allowedRoles?: NavItemDataProps['allowedRoles']) => boolean,
  checkPermission?: (permission?: string) => boolean,
  checkPermissionAny?: (permissions: string[]) => boolean
): boolean {
  if (item.allowedRoles && checkPermissions && checkPermissions(item.allowedRoles)) return false;

  if (item.requiredPermissionAny?.length) {
    if (!checkPermissionAny) return false;
    return checkPermissionAny(item.requiredPermissionAny);
  }

  if (item.requiredPermission) {
    if (!checkPermission) return false;
    return checkPermission(item.requiredPermission);
  }

  if (item.children) {
    return item.children.some((child) =>
      canShowNavItem(child, checkPermissions, checkPermission, checkPermissionAny)
    );
  }

  // No permission gate (e.g. profile) — visible to any authenticated user
  return true;
}
