import { paths } from 'src/routes/paths';

import { apiRoutes, axiosInstance } from 'src/api';

/**
 * Normalize a permission value to string (handles objects like { name: "user.view" })
 */
function toPermissionString(p: unknown): string | null {
  if (typeof p === 'string' && p) return p;
  if (p && typeof p === 'object' && typeof (p as any).name === 'string') return (p as any).name;
  return null;
}

/**
 * Extract permissions from various API response structures.
 * Supports: user.permissions, user.data.permissions, data.permissions, user.roles[].permissions
 */
export function extractPermissionsFromLoginResponse(
  user: any,
  responseData?: { data?: any }
): string[] {
  const result = new Set<string>();

  const tryAdd = (source: unknown) => {
    if (!source) return;
    const arr = Array.isArray(source) ? source : [];
    arr.forEach((p) => {
      const s = toPermissionString(p);
      if (s) result.add(s);
    });
  };

  tryAdd(user?.permissions);
  tryAdd(user?.data?.permissions);
  tryAdd(responseData?.data?.permissions);
  tryAdd(responseData?.data?.user?.permissions);

  const roles = user?.roles ?? responseData?.data?.user?.roles;
  if (Array.isArray(roles)) {
    roles.forEach((r: any) => tryAdd(r?.permissions));
  }

  return Array.from(result);
}

/**
 * Fetch permissions from /me API (used when login response lacks permissions).
 * The /me endpoint typically returns full user data including roles/permissions.
 */
export async function fetchPermissionsFromMe(): Promise<string[]> {
  try {
    const res = await axiosInstance.get(apiRoutes.auth.me);
    const responseData = res.data;
    const user = responseData?.data?.user || responseData?.user || responseData;
    return extractPermissionsFromLoginResponse(user, { data: responseData?.data ?? responseData });
  } catch {
    return [];
  }
}

/**
 * Default landing path after login (and when a route guard needs a safe redirect).
 * Uses session user from `admin/auth/login` (stored as `user_data`); token is never shown on this page.
 */
export function getPostLoginRedirectPath(_permissions?: string[] | null): string {
  return paths.dashboard.profile;
}
