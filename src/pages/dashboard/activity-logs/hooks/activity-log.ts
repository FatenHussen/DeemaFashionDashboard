import { queryKeys } from '@/api';
import { useQuery } from '@tanstack/react-query';

import { _ActivityLogApi } from '../api/activity-log.services';

export const useFetchActivityLogs = (
  page: number = 1,
  perPage: number = 10,
  filters?: { action?: string; model?: string; search?: string }
) =>
  useQuery({
    queryKey: queryKeys.activityLog.list({ page, per_page: perPage, ...filters }),
    queryFn: () => _ActivityLogApi.getListActivityLogs({ page, per_page: perPage, ...filters }),
  });
