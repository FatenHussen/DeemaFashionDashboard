import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _CityApi, type CityCreateUpdatePayload } from '../api/city.services';

export const useFetchCities = (
  page: number = 1,
  limit: number = 25,
  params?: { search?: string }
) =>
  useQuery({
    queryKey: queryKeys.city.list({ page, limit, ...params }),
    queryFn: () => _CityApi.getListCities({ page, per_page: limit, ...params }),
  });

export const useFetchCityById = (id: number | string) => useQuery({
    queryKey: queryKeys.city.details(id),
    queryFn: () => _CityApi.getCityById(id),
    enabled: !!id,
  });

export const useCreateCity = (page?: number, limit?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CityCreateUpdatePayload) => _CityApi.createCity(data),
    onSuccess: () => {
      // Invalidate and refetch all list queries
      queryClient.invalidateQueries({
        queryKey: ['city', 'list'],
        refetchType: 'active',
      });
      // Also explicitly refetch all matching queries
      queryClient.refetchQueries({
        queryKey: ['city', 'list'],
      });
    },
  });
};

export const useUpdateCity = (page?: number, limit?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: CityCreateUpdatePayload }) =>
      _CityApi.updateCity(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch all list queries
      queryClient.invalidateQueries({
        queryKey: ['city', 'list'],
        refetchType: 'active',
      });
      // Also explicitly refetch all matching queries
      queryClient.refetchQueries({
        queryKey: ['city', 'list'],
      });
      // Invalidate the specific city details query
      queryClient.invalidateQueries({
        queryKey: queryKeys.city.details(variables.id),
      });
    },
  });
};

export const useDeleteCity = (page?: number, limit?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _CityApi.deleteCity(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch all list queries
      queryClient.invalidateQueries({
        queryKey: ['city', 'list'],
        refetchType: 'active',
      });
      // Also explicitly refetch all matching queries
      queryClient.refetchQueries({
        queryKey: ['city', 'list'],
      });
      // Invalidate the specific city details query
      queryClient.invalidateQueries({
        queryKey: queryKeys.city.details(id),
      });
    },
  });
};
