import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api';
import { _AdminApi, type AdminCreateUpdatePayload } from '../api/admin.services';

export const useFetchAdmins = (page: number = 1, limit: number = 25) => {
  return useQuery({
    queryKey: queryKeys.admin.list({ page, limit }),
    queryFn: () => _AdminApi.getListAdmin(),
  });
};

export const useFetchAdminById = (id: number | string) => {
  return useQuery({
    queryKey: queryKeys.admin.details(id),
    queryFn: () => _AdminApi.getAdminById(id),
    enabled: !!id,
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminCreateUpdatePayload) => _AdminApi.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.list() });
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: AdminCreateUpdatePayload }) =>
      _AdminApi.updateAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.list() });
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _AdminApi.deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.list() });
    },
  });
};
