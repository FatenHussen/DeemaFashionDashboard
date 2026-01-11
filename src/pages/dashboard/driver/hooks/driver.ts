import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _DriverApi, type DriverCreateUpdatePayload } from '../api/driver.services';

export const useFetchDrivers = (page: number = 1, limit: number = 25) => useQuery({
    queryKey: queryKeys.driver.list({ page, limit }),
    queryFn: () => _DriverApi.getListDrivers(),
  });

export const useFetchDriverById = (id: number | string) => useQuery({
    queryKey: queryKeys.driver.details(id),
    queryFn: () => _DriverApi.getDriverById(id),
    enabled: !!id,
  });

export const useCreateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DriverCreateUpdatePayload) => _DriverApi.createDriver(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.driver.list() });
    },
  });
};

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: DriverCreateUpdatePayload }) =>
      _DriverApi.updateDriver(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.driver.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.driver.details(variables.id) });
    },
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _DriverApi.deleteDriver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.driver.list() });
    },
  });
};

