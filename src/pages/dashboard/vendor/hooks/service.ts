import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _ServiceApi, type ServiceCreateUpdatePayload } from '../api/service.services';

export const useFetchServices = (page: number = 1, limit: number = 25) =>
  useQuery({
    queryKey: queryKeys.service.list({ page, limit }),
    queryFn: () => _ServiceApi.getListServices(page, limit),
  });

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ServiceCreateUpdatePayload) => _ServiceApi.createService(data),
    onSuccess: () => {
      // Invalidate all service list queries
      queryClient.invalidateQueries({
        queryKey: ['service', 'list'],
        refetchType: 'active',
      });
      // Explicitly refetch all active service list queries
      queryClient.refetchQueries({
        queryKey: ['service', 'list'],
        type: 'active',
      });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: ServiceCreateUpdatePayload }) =>
      _ServiceApi.updateService(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['service', 'list'],
        refetchType: 'active',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.service.details(variables.id) });
      queryClient.refetchQueries({
        queryKey: ['service', 'list'],
        type: 'active',
      });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _ServiceApi.deleteService(id),
    onSuccess: () => {
      // Invalidate all service list queries
      queryClient.invalidateQueries({
        queryKey: ['service', 'list'],
        refetchType: 'active',
      });

      // Explicitly refetch all active service list queries
      queryClient.refetchQueries({
        queryKey: ['service', 'list'],
        type: 'active',
      });
    },
  });
};
