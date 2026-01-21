import { useAuthContext } from '@/pages/auth/hooks/use-auth-context';

import { can, canAny, canAll } from '../permissions';

/**
 * Hook to access user permissions and permission checking functions
 */
export function usePermissions() {
  const { permissions } = useAuthContext();

  return {
    permissions: permissions || [],
    can: (permission: string) => can(permissions, permission),
    canAny: (permissionList: string[]) => canAny(permissions, permissionList),
    canAll: (permissionList: string[]) => canAll(permissions, permissionList),
  };
}

