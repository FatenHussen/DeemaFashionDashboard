import { Navigate, useLocation } from 'react-router';
import { LoadingScreen } from '@/shared/components/loading-screen';
import { useAuthContext } from '@/pages/auth/hooks/use-auth-context';

import { usePermissions } from '../hooks/use-permissions';
import { getPostLoginRedirectPath } from '../post-login-redirect';

// ----------------------------------------------------------------------

type RequirePermissionProps = {
  permission?: string;
  /** If provided, user needs ANY of these permissions (use instead of permission) */
  permissionAny?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
};

/**
 * Route guard component that checks if user has required permission
 * If user lacks permission, redirects to first permitted path (or /403 fallback)
 */
export function RequirePermission({
  permission,
  permissionAny,
  children,
  fallback,
  redirectTo = '/403',
}: RequirePermissionProps) {
  const { pathname } = useLocation();
  const { loading, authenticated, permissions } = useAuthContext();
  const { can, canAny } = usePermissions();

  // Show loading screen while checking auth
  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!authenticated) {
    return <Navigate to="/auth/jwt/sign-in" replace />;
  }

  // Check permission (single or any of list)
  const hasAccess = permissionAny
    ? canAny(permissionAny)
    : permission
      ? can(permission)
      : false;
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    // Redirect to first permitted path instead of 403 when user has other permissions
    const permittedPath = getPostLoginRedirectPath(permissions);
    const isSamePath = permittedPath === pathname || pathname.startsWith(permittedPath + '/');
    const targetPath = !isSamePath ? permittedPath : redirectTo;
    return <Navigate to={targetPath} replace />;
  }

  return <>{children}</>;
}

