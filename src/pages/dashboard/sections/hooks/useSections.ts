import type { SectionListQueryParams, SectionCreateUpdatePayload } from '../types/section.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _SectionApi } from '../api/section.services';

/** Drops cached section rows so pickers and page details reload the current API payload. */
function invalidateSectionSurfaces(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['section', 'list'] });
  queryClient.invalidateQueries({ queryKey: ['section', 'manual-items'] });
  queryClient.invalidateQueries({ queryKey: ['pageBuilder', 'sliders'] });
  queryClient.invalidateQueries({ queryKey: ['pageBuilder', 'details'] });
  queryClient.invalidateQueries({ queryKey: ['pageSection', 'pagePreview'] });
}

export const useFetchSections = (params?: SectionListQueryParams) =>
  useQuery({
    queryKey: queryKeys.section.list(params),
    queryFn: () => _SectionApi.getListSections(params),
    staleTime: 0,
    refetchOnMount: 'always',
  });

export const useFetchSectionDetails = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.section.details(id),
    queryFn: () => _SectionApi.getSectionDetails(id),
    enabled: !!id && /^\d+$/.test(String(id).trim()),
    staleTime: 0,
    refetchOnMount: 'always',
  });

export const useCreateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SectionCreateUpdatePayload) => _SectionApi.createSection(data),
    onSuccess: () => {
      invalidateSectionSurfaces(queryClient);
    },
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: SectionCreateUpdatePayload }) =>
      _SectionApi.updateSection(id, data),
    onSuccess: (_, variables) => {
      invalidateSectionSurfaces(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.section.details(variables.id) });
    },
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _SectionApi.deleteSection(id),
    onSuccess: () => {
      invalidateSectionSurfaces(queryClient);
    },
  });
};
