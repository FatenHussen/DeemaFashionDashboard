import { toPermissionString } from 'src/auth/permissions';
import { paths } from 'src/routes/paths';

import { apiRoutes, axiosInstance } from 'src/api';

function pickUserFromAuthPayload(payload: any): any | null {
  if (!payload || typeof payload !== 'object') return null;
  if (payload.data?.user && typeof payload.data.user === 'object') return payload.data.user;
  if (payload.user && typeof payload.user === 'object') return payload.user;
  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data;
  }
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
  tryAdd(responseData?.permissions);
  tryAdd(responseData?.data?.permissions);
  tryAdd(responseData?.data?.user?.permissions);
  tryAdd(responseData?.data?.data?.permissions);

  const roles = user?.roles ?? responseData?.data?.user?.roles ?? responseData?.data?.roles;
  if (Array.isArray(roles)) {
    roles.forEach((r: any) => tryAdd(r?.permissions));
  }

  return Array.from(result);
}

/** Merge login / cached user with `GET /admin/auth/profile` so nav keys like `warranty.view` stay current. */
export function mergeAuthUser(base: any, profileResponse?: any): any {
  const profileUser = pickUserFromAuthPayload(profileResponse);
  const merged = { ...(base ?? {}), ...(profileUser ?? {}) };
  return {
    ...merged,
    permissions: extractPermissionsFromLoginResponse(merged, {
      data: profileResponse?.data ?? profileResponse,
    }),
  };
}

/**
 * Fetch the admin profile (`GET /admin/auth/profile`) — source of `profile.permissions`.
 */
export async function fetchAdminProfileUser(): Promise<any | null> {
  const res = await axiosInstance.get(apiRoutes.auth.profile);
  return mergeAuthUser(pickUserFromAuthPayload(res.data), res.data);
}

/**
 * Fetch permissions from /me API (used when login response lacks permissions).
 * The /me endpoint typically returns full user data including roles/permissions.
 */
export async function fetchPermissionsFromMe(): Promise<string[]> {
  try {
    const profile = await fetchAdminProfileUser();
    if (profile?.permissions?.length) return profile.permissions;
  } catch {
    /* fall through to /me */
  }
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
