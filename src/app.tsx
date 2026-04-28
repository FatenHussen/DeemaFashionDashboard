import 'src/global.css';
import 'src/lib/i18n';
import 'react-toastify/dist/ReactToastify.css';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import { QueryClientProvider } from '@tanstack/react-query';

import { usePathname } from 'src/routes/hooks';

import { queryClient } from 'src/lib/query-client';
import { AuthProvider } from 'src/pages/auth/context/jwt';
import { ProgressBar } from 'src/shared/components/progress-bar';
import { useLocalizationStore } from 'src/store/useLocalizationStore';
import { MotionLazy } from 'src/shared/components/animate/motion-lazy';
import {
  SettingsDrawer,
  SettingsEffects,
  defaultSettings,
  SettingsProvider,
} from 'src/shared/components/settings';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();
  const { direction } = useLocalizationStore();
  useDocumentTitle();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider defaultSettings={defaultSettings}>
          <SettingsEffects />
          <MotionLazy>
            <ProgressBar />
            <ToastContainer
              position={direction === 'rtl' ? 'top-left' : 'top-right'}
              autoClose={3000}
              theme="colored"
              rtl={direction === 'rtl'}
            />
            <SettingsDrawer defaultSettings={defaultSettings} />
            {children}
          </MotionLazy>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function useDocumentTitle() {
  const { t, i18n } = useTranslation('common');

  useEffect(() => {
    document.title = t('appTitle');
  }, [t, i18n.language]);

  return null;
}
