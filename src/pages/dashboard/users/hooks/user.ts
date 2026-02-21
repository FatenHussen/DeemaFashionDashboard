import type {
  UserCreatePayload,
  UserUpdatePayload,
  UserConvertAffiliatePayload,
} from '../types/user.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _UserApi } from '../api/user.services';

export const useFetchUsers = (
  page: number = 1,
  perPage: number = 10,
  params?: {
    is_affiliate?: number;
    affiliate_approved?: number;
    area_id?: number;
  }
) =>
  useQuery({
    queryKey: queryKeys.user.list({ page, per_page: perPage, ...params }),
    queryFn: () =>
      _UserApi.getListUsers({ page, per_page: perPage, ...params }),
  });

export const useFetchUserById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.user.details(id),
    queryFn: () => _UserApi.getUserById(id),
    enabled: !!id,
  });

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserCreatePayload) => _UserApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'list'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: UserUpdatePayload;
    }) => _UserApi.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'list'] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.details(variables.id),
      });
    },
  });
};

export const useConvertToAffiliate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: UserConvertAffiliatePayload;
    }) => _UserApi.convertToAffiliate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'list'] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.details(variables.id),
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _UserApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'list'] });
    },
  });
};
