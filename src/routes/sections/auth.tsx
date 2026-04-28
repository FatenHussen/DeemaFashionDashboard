import type { RouteObject } from 'react-router';

import { Suspense } from 'react';
import { Outlet } from 'react-router';

import { SplashScreen } from 'src/shared/components/loading-screen';

import { JwtSignInRoute } from './auth-jwt-sign-in-route';

// ----------------------------------------------------------------------

const authJwt = {
  path: 'jwt',
  children: [
    {
      path: 'sign-in',
      element: <JwtSignInRoute />,
    },
  ],
};

// ----------------------------------------------------------------------

export const authRoutes: RouteObject[] = [
  {
    path: 'auth',
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: [authJwt],
  },
];
