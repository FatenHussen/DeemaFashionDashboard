import type { NotificationCreatePayload } from '../types/notification.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _AdminNotificationApi } from '../api/notification.services';

export const useFetchAdminNotifications = (
  page: number = 1,
  perPage: number = 10,
  search?: string
) =>
  useQuery({
    queryKey: queryKeys.adminNotification.list({ page, per_page: perPage, search }),
    queryFn: () => _AdminNotificationApi.getList({ page, per_page: perPage, search }),
  });

export const useCreateAdminNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NotificationCreatePayload) => _AdminNotificationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotification', 'list'] });
    },
  });
};
