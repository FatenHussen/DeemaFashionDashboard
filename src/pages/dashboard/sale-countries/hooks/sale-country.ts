import type { SaleCountryCreatePayload } from '../types/sale-country.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _SaleCountryApi } from '../api/sale-country.services';

export const useFetchSaleCountries = (
  page: number = 1,
  perPage: number = 10,
  isActive?: number | string,
  search?: string
) =>
  useQuery({
    queryKey: queryKeys.saleCountry.list({
      page,
      per_page: perPage,
      ...(isActive !== undefined && isActive !== '' ? { is_active: isActive } : {}),
      ...(search?.trim() ? { search: search.trim() } : {}),
    }),
    queryFn: () =>
      _SaleCountryApi.getListSaleCountries({
        page,
        per_page: perPage,
        ...(isActive !== undefined && isActive !== '' ? { is_active: isActive } : {}),
        ...(search?.trim() ? { search: search.trim() } : {}),
      }),
  });

export const useFetchSaleCountryById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.saleCountry.details(id),
    queryFn: () => _SaleCountryApi.getSaleCountryById(id),
    enabled: !!id,
  });

export const useCreateSaleCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SaleCountryCreatePayload) => _SaleCountryApi.createSaleCountry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saleCountry', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['sale-countries'] });
    },
  });
};

export const useUpdateSaleCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<SaleCountryCreatePayload> }) =>
      _SaleCountryApi.updateSaleCountry(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['saleCountry', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['sale-countries'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.saleCountry.details(variables.id) });
    },
  });
};

export const useDeleteSaleCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _SaleCountryApi.deleteSaleCountry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saleCountry', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['sale-countries'] });
    },
  });
};
