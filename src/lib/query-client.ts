import { QueryClient } from '@tanstack/react-query';

// ----------------------------------------------------------------------

/** Shared client so language changes (and other global events) can invalidate caches. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
