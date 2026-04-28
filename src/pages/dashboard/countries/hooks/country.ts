import type { CountryCreatePayload } from '../types/country.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _CountryApi } from '../api/country.services';

export const useFetchCountries = (page: number = 1, perPage: number = 10, filters?: { is_active?: string; search?: string }) =>
  useQuery({
    queryKey: queryKeys.country.list({ page, per_page: perPage, ...filters }),
    queryFn: () => _CountryApi.getListCountries({ page, per_page: perPage, ...filters }),
  });

export const useFetchCountryById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.country.details(id),
    queryFn: () => _CountryApi.getCountryById(id),
    enabled: !!id,
  });

export const useCreateCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CountryCreatePayload) => _CountryApi.createCountry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['country', 'list'] });
    },
  });
};

export const useUpdateCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<CountryCreatePayload> }) =>
      _CountryApi.updateCountry(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['country', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.country.details(variables.id) });
    },
  });
};

export const useDeleteCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _CountryApi.deleteCountry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['country', 'list'] });
    },
  });
};
