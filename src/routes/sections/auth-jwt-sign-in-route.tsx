import { type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { GuestGuard } from 'src/pages/auth/guard';
import JwtSignInPage from 'src/pages/auth/jwt/sign-in';
import { AuthSplitLayout } from 'src/layouts/auth-split';

// ----------------------------------------------------------------------

export function JwtSignInRoute() {
  const { t } = useTranslation('common');

  return (
    <GuestGuard>
      <AuthSplitLayout
        unifiedCard
        cssVars={{ '--layout-auth-content-width': '100%' } as CSSProperties}
        slotProps={{
          main: {
            className: '!min-h-[calc(100dvh-var(--layout-header-desktop-height,0px))] !before:!hidden !after:!hidden',
          },
          content: {
            className:
              'w-full max-w-none items-start justify-center overflow-hidden px-6 py-10 sm:px-12 sm:py-12 md:px-16 lg:px-20',
          },
          section: {
            methods: [],
            marketingVariant: 'cool',
            title: t('authMarketingTitle'),
            subtitle: t('authMarketingSubtitle'),
          },
        }}
      >
        <JwtSignInPage />
      </AuthSplitLayout>
    </GuestGuard>
  );
}
