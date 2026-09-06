import type { AuthState } from '../../types';

import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';

import { apiRoutes, axiosInstance } from 'src/api';

import { mergeAuthUser, extractPermissionsFromLoginResponse } from 'src/auth/post-login-redirect';

import { isValidToken } from './utils';
import { JWT_STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const { state, setState } = useSetState<AuthState>({ user: null, loading: true });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(JWT_STORAGE_KEY);

      if (!accessToken || !isValidToken(accessToken)) {
        sessionStorage.removeItem('user_data');
        setState({ user: null, loading: false });
        return;
      }

      let storedUser: any = null;
      const rawStored = sessionStorage.getItem('user_data');
      if (rawStored) {
        try {
          storedUser = JSON.parse(rawStored);
        } catch {
          storedUser = null;
        }
      }

      // Paint cached user immediately, then refresh from GET /admin/auth/profile.
      if (storedUser) {
        setState({ user: mergeAuthUser(storedUser), loading: false });
      }

      try {
        const res = await axiosInstance.get(apiRoutes.auth.profile);
        const userData = mergeAuthUser(storedUser, res.data);
        if (userData && (userData.id || userData.email || storedUser)) {
          sessionStorage.setItem('user_data', JSON.stringify(userData));
          setState({ user: userData, loading: false });
          return;
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);

        if (error?.response?.status === 401) {
          sessionStorage.removeItem(JWT_STORAGE_KEY);
          sessionStorage.removeItem('user_data');
          setState({ user: null, loading: false });
          return;
        }
      }

      if (storedUser) {
        setState({ user: mergeAuthUser(storedUser), loading: false });
        return;
      }

      try {
        const res = await axiosInstance.get(apiRoutes.auth.me);
        const userData = mergeAuthUser(res.data?.data?.user || res.data?.user || res.data, res.data);
        if (userData) {
          sessionStorage.setItem('user_data', JSON.stringify(userData));
          setState({ user: userData, loading: false });
          return;
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }

      setState({ user: null, loading: false });
    } catch (error) {
      console.error('Error checking user session:', error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  const status = state.loading ? 'loading' : state.user ? 'authenticated' : 'unauthenticated';

  const memoizedValue = useMemo(() => {
    let userRole = 'admin';
    if (state.user) {
      if (Array.isArray((state.user as any)?.roles) && (state.user as any).roles.length > 0) {
        userRole = (state.user as any).roles[0];
      } else if ((state.user as any)?.role) {
        userRole = (state.user as any).role;
      }
    }

    const userPermissions = extractPermissionsFromLoginResponse(state.user);

    return {
      user: state.user ? { ...state.user, role: userRole } : null,
      permissions: userPermissions,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    };
  }, [checkUserSession, state.user, status]);

  return <AuthContext value={memoizedValue}>{children}</AuthContext>;
}
