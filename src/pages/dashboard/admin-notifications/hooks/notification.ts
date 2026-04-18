import type { NotificationType, NotificationCreatePayload } from '../types/notification.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _AdminNotificationApi } from '../api/notification.services';

export const useFetchAdminNotifications = (
  page: number = 1,
  perPage: number = 10,
  search?: string,
  type?: NotificationType | 'all'
) =>
  useQuery({
    queryKey: queryKeys.adminNotification.list({ page, per_page: perPage, search, type }),
    queryFn: () => _AdminNotificationApi.getList({ page, per_page: perPage, search, type }),
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

export const useFetchAdminNotificationById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.adminNotification.details(id),
    queryFn: () => _AdminNotificationApi.getById(id),
    enabled: !!id,
  });
