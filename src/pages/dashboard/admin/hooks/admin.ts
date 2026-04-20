import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _AdminApi, type AdminCreateUpdatePayload } from '../api/admin.services';

export const useFetchAdmins = (
  page: number = 1,
  limit: number = 25,
  params?: {
    search?: string;
  }
) =>
  useQuery({
    queryKey: queryKeys.admin.list({ page, limit, ...params }),
    queryFn: () => _AdminApi.getListAdmin({ page, per_page: limit, ...params }),
  });

export const useFetchAdminById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.admin.details(id),
    queryFn: () => _AdminApi.getAdminById(id),
    enabled: !!id,
  });

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminCreateUpdatePayload) => _AdminApi.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'list'] });
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: AdminCreateUpdatePayload }) =>
      _AdminApi.updateAdmin(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.details(variables.id) });
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _AdminApi.deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'list'] });
    },
  });
};
