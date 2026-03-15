import type { NavItemDataProps } from '../types';

// ----------------------------------------------------------------------

/** Check if item should be visible (mirrors NavList permission logic) */
export function canShowNavItem(
  item: NavItemDataProps,
  checkPermissions?: (allowedRoles?: NavItemDataProps['allowedRoles']) => boolean,
  checkPermission?: (permission?: string) => boolean,
  checkPermissionAny?: (permissions: string[]) => boolean
): boolean {
  if (item.allowedRoles && checkPermissions && checkPermissions(item.allowedRoles)) return false;
  if (item.requiredPermissionAny && checkPermissionAny) return checkPermissionAny(item.requiredPermissionAny);
  if (item.requiredPermission && checkPermission) return checkPermission(item.requiredPermission);
  if (item.children) {
    return item.children.some((child) =>
      canShowNavItem(child, checkPermissions, checkPermission, checkPermissionAny)
    );
  }
  return true;
}
