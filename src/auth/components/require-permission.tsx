import { Navigate } from 'react-router';
import { LoadingScreen } from '@/shared/components/loading-screen';
import { useAuthContext } from '@/pages/auth/hooks/use-auth-context';

import { usePermissions } from '../hooks/use-permissions';

// ----------------------------------------------------------------------

type RequirePermissionProps = {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
};

/**
 * Route guard component that checks if user has required permission
 * If user lacks permission, redirects to /403 or shows fallback
 */
export function RequirePermission({
  permission,
  children,
  fallback,
  redirectTo = '/dashboard/403',
}: RequirePermissionProps) {
  const { loading, authenticated } = useAuthContext();
  const { can } = usePermissions();

  // Show loading screen while checking auth
  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!authenticated) {
    return <Navigate to="/auth/jwt/sign-in" replace />;
  }

  // Check permission
  if (!can(permission)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

