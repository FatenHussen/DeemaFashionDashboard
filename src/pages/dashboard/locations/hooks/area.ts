import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _AreaApi, type AreaCreateUpdatePayload } from '../api/area.services';

export const useFetchAreas = (page: number = 1, limit: number = 25) => useQuery({
    queryKey: queryKeys.area.list({ page, limit }),
    queryFn: () => _AreaApi.getListAreas(),
  });

export const useFetchAreaById = (id: number | string) => useQuery({
    queryKey: queryKeys.area.details(id),
    queryFn: () => _AreaApi.getAreaById(id),
    enabled: !!id,
  });

export const useCreateArea = (page?: number, limit?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AreaCreateUpdatePayload) => _AreaApi.createArea(data),
    onSuccess: () => {
      // Invalidate and refetch all list queries
      queryClient.invalidateQueries({ 
        queryKey: ['area', 'list'],
        refetchType: 'active',
      });
      // Also explicitly refetch all matching queries
      queryClient.refetchQueries({
        queryKey: ['area', 'list'],
      });
    },
  });
};

export const useUpdateArea = (page?: number, limit?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: AreaCreateUpdatePayload }) =>
      _AreaApi.updateArea(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch all list queries
      queryClient.invalidateQueries({ 
        queryKey: ['area', 'list'],
        refetchType: 'active',
      });
      // Also explicitly refetch all matching queries
      queryClient.refetchQueries({
        queryKey: ['area', 'list'],
      });
      // Invalidate the specific area details query
      queryClient.invalidateQueries({
        queryKey: queryKeys.area.details(variables.id),
      });
    },
  });
};

export const useDeleteArea = (page?: number, limit?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _AreaApi.deleteArea(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch all list queries
      queryClient.invalidateQueries({ 
        queryKey: ['area', 'list'],
        refetchType: 'active',
      });
      // Also explicitly refetch all matching queries
      queryClient.refetchQueries({
        queryKey: ['area', 'list'],
      });
      // Invalidate the specific area details query
      queryClient.invalidateQueries({
        queryKey: queryKeys.area.details(id),
      });
    },
  });
};

