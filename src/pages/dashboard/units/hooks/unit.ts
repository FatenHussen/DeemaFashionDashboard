import type { UnitCreateUpdatePayload } from '../types/unit.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _UnitApi, type UnitListQueryParams } from '../api/unit.services';

export const useFetchUnits = (params?: UnitListQueryParams) =>
  useQuery({
    queryKey: queryKeys.unit.list(params as Record<string, unknown>),
    queryFn: () => _UnitApi.getListUnits(params),
  });

export const useFetchUnitById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.unit.details(id),
    queryFn: () => _UnitApi.getUnitById(id),
    enabled: !!id,
  });

export const useCreateUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UnitCreateUpdatePayload) => _UnitApi.createUnit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit', 'list'] });
    },
  });
};

export const useUpdateUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: UnitCreateUpdatePayload }) =>
      _UnitApi.updateUnit(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['unit', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.unit.details(variables.id) });
    },
  });
};

export const useDeleteUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _UnitApi.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit', 'list'] });
    },
  });
};
