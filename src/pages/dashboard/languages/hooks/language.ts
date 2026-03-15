import type {
  LanguageListParams,
  LanguageCreateUpdatePayload,
} from '../types/language.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _LanguageApi } from '../api/language.services';

export const useFetchLanguages = (params?: LanguageListParams) =>
  useQuery({
    queryKey: queryKeys.language.list(params),
    queryFn: () => _LanguageApi.getListLanguage(params),
  });

export const useFetchLanguageById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.language.details(id),
    queryFn: () => _LanguageApi.getLanguageById(id),
    enabled: !!id,
  });

export const useCreateLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LanguageCreateUpdatePayload) => _LanguageApi.createLanguage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['language', 'list'] });
    },
  });
};

export const useUpdateLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: LanguageCreateUpdatePayload }) =>
      _LanguageApi.updateLanguage(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['language', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.language.details(variables.id) });
    },
  });
};

export const useDeleteLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _LanguageApi.deleteLanguage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['language', 'list'] });
    },
  });
};
