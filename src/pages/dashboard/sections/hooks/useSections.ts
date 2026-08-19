import type { SectionListQueryParams, SectionCreateUpdatePayload } from '../types/section.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _SectionApi } from '../api/section.services';

export const useFetchSections = (params?: SectionListQueryParams) =>
  useQuery({
    queryKey: queryKeys.section.list(params),
    queryFn: () => _SectionApi.getListSections(params),
  });

export const useFetchSectionDetails = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.section.details(id),
    queryFn: () => _SectionApi.getSectionDetails(id),
    enabled: !!id && /^\d+$/.test(String(id).trim()),
  });

export const useCreateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SectionCreateUpdatePayload) => _SectionApi.createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['section', 'list'] });
    },
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: SectionCreateUpdatePayload }) =>
      _SectionApi.updateSection(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['section', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.section.details(variables.id) });
    },
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _SectionApi.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['section', 'list'] });
    },
  });
};
