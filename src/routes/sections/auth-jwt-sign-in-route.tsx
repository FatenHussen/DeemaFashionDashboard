import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import { GuestGuard } from 'src/pages/auth/guard';
import { AuthSplitLayout } from 'src/layouts/auth-split';
import { SplashScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

const JwtSignInPage = lazy(() => import('src/pages/auth/jwt/sign-in'));

export function JwtSignInRoute() {
  const { t } = useTranslation('common');

  return (
    <GuestGuard>
      <AuthSplitLayout
        slotProps={{
          section: { title: t('authWelcomeBack') },
        }}
      >
        <Suspense fallback={<SplashScreen />}>
          <JwtSignInPage />
        </Suspense>
      </AuthSplitLayout>
    </GuestGuard>
  );
}
