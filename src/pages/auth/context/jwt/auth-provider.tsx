import type { AuthState } from '../../types';

import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';

import { axiosInstance, apiRoutes } from 'src/api';

import { AuthContext } from '../auth-context';
import { JWT_STORAGE_KEY } from './constant';
import { isValidToken } from './utils';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const { state, setState } = useSetState<AuthState>({ user: null, loading: true });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(JWT_STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        // Try to get user from sessionStorage first (from login response)
        const storedUser = sessionStorage.getItem('user_data');

        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            setState({ user, loading: false });
            return;
          } catch (e) {
            // If parsing fails, fetch from API
          }
        }

        // If no stored user, fetch from API
        try {
          const res = await axiosInstance.get(apiRoutes.auth.me);

          // Handle different response structures
          const userData = res.data?.data?.user || res.data?.user || res.data;

          if (userData) {
            // Store user data
            sessionStorage.setItem('user_data', JSON.stringify(userData));
            setState({ user: userData, loading: false });
          } else {
            setState({ user: null, loading: false });
          }
        } catch (error: any) {
          console.error('Error fetching user data:', error);

          // If 401/403, token is invalid - clear everything
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            sessionStorage.removeItem(JWT_STORAGE_KEY);
            sessionStorage.removeItem('user_data');
            setState({ user: null, loading: false });
            return;
          }

          // For other errors, try to use stored user
          const storedUser = sessionStorage.getItem('user_data');
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser);
              setState({ user, loading: false });
            } catch (e) {
              setState({ user: null, loading: false });
            }
          } else {
            setState({ user: null, loading: false });
          }
        }
      } else {
        // No valid token, clear user data
        sessionStorage.removeItem('user_data');
        setState({ user: null, loading: false });
      }
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
    // Extract role from user data (could be in roles array or role field)
    let userRole = 'admin';
    if (state.user) {
      if (Array.isArray((state.user as any)?.roles) && (state.user as any).roles.length > 0) {
        userRole = (state.user as any).roles[0];
      } else if ((state.user as any)?.role) {
        userRole = (state.user as any).role;
      }
    }

    // Extract permissions from user data
    const userPermissions: string[] = Array.isArray((state.user as any)?.permissions)
      ? (state.user as any).permissions
      : [];

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
