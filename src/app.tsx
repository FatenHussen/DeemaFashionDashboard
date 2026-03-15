import 'src/global.css';
import 'src/lib/i18n';
import 'react-toastify/dist/ReactToastify.css';

import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { usePathname } from 'src/routes/hooks';

import { AuthProvider } from 'src/pages/auth/context/jwt';
import { ProgressBar } from 'src/shared/components/progress-bar';
import { MotionLazy } from 'src/shared/components/animate/motion-lazy';
import {
  SettingsDrawer,
  SettingsEffects,
  defaultSettings,
  SettingsProvider,
} from 'src/shared/components/settings';

// ----------------------------------------------------------------------

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider defaultSettings={defaultSettings}>
          <SettingsEffects />
          <MotionLazy>
            <ProgressBar />
            <ToastContainer position="top-right" autoClose={3000} theme="colored" rtl={false} />
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
