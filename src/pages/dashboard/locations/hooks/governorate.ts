import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _GovernorateApi, type GovernorateCreateUpdatePayload } from '../api/governorate.services';

export const useFetchGovernorates = (page: number = 1, limit: number = 25) => useQuery({
    queryKey: queryKeys.governorate.list({ page, limit }),
    queryFn: () => _GovernorateApi.getListGovernorates({ page, per_page: limit }),
  });

export const useFetchGovernorateById = (id: number | string) => useQuery({
    queryKey: queryKeys.governorate.details(id),
    queryFn: () => _GovernorateApi.getGovernorateById(id),
    enabled: !!id,
  });

export const useCreateGovernorate = (page?: number, limit?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GovernorateCreateUpdatePayload) => _GovernorateApi.createGovernorate(data),
    onSuccess: () => {
      // Invalidate all list queries
      queryClient.invalidateQueries({ queryKey: ['governorate', 'list'] });
      // Refetch the current page query if pagination params are provided
      if (page !== undefined && limit !== undefined) {
        queryClient.refetchQueries({
          queryKey: queryKeys.governorate.list({ page, limit }),
        });
      }
    },
  });
};

export const useUpdateGovernorate = (page?: number, limit?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: GovernorateCreateUpdatePayload }) =>
      _GovernorateApi.updateGovernorate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['governorate', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.governorate.details(variables.id) });
      if (page !== undefined && limit !== undefined) {
        queryClient.refetchQueries({
          queryKey: queryKeys.governorate.list({ page, limit }),
        });
      }
    },
  });
};

export const useDeleteGovernorate = (page?: number, limit?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _GovernorateApi.deleteGovernorate(id),
    onSuccess: () => {
      // Invalidate all list queries
      queryClient.invalidateQueries({ queryKey: ['governorate', 'list'] });
      // Refetch the current page query if pagination params are provided
      if (page !== undefined && limit !== undefined) {
        queryClient.refetchQueries({
          queryKey: queryKeys.governorate.list({ page, limit }),
        });
      }
    },
  });
};
