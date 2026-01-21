import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _RoleApi, type RoleCreateUpdatePayload } from '../api/role.services';

export const useFetchRoles = (page: number = 1, limit: number = 25) => useQuery({
    queryKey: queryKeys.role.list({ page, limit }),
    queryFn: () => _RoleApi.getListRoles(),
  });

export const useFetchRoleById = (id: number | string) => useQuery({
    queryKey: queryKeys.role.details(id),
    queryFn: () => _RoleApi.getRoleById(id),
    enabled: !!id,
  });

export const useFetchPermissions = (page: number = 1, limit: number = 100) => useQuery({
    queryKey: queryKeys.permission.list({ page, limit }),
    queryFn: () => _RoleApi.getListPermissions(),
  });

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RoleCreateUpdatePayload) => _RoleApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.role.list() });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: RoleCreateUpdatePayload }) =>
      _RoleApi.updateRole(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.role.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.role.details(variables.id) });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _RoleApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.role.list() });
    },
  });
};

