import type { SectionCreateUpdatePayload } from '../types/section.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _SectionApi } from '../api/section.services';

export const useFetchSections = (page: number = 1, limit: number = 25) =>
  useQuery({
    queryKey: queryKeys.section.list({ page, limit }),
    queryFn: () => _SectionApi.getListSections(page, limit),
  });

export const useFetchSectionDetails = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.section.details(id),
    queryFn: () => _SectionApi.getSectionDetails(id),
    enabled: !!id,
  });

export const useCreateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SectionCreateUpdatePayload) => _SectionApi.createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.section.list() });
    },
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: SectionCreateUpdatePayload }) =>
      _SectionApi.updateSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.section.list() });
    },
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _SectionApi.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.section.list() });
    },
  });
};
