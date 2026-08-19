import type { PageSectionUpdatePayload } from '../types/page-section.types';
import type { PagePreviewQueryParams, PageSectionReorderPayload } from '../types/page-preview.types';

import { queryKeys } from '@/api/queryKeys';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _PageSectionApi } from '../api/page-section.services';
import {
  serializePagePreviewParams,
  toPagePreviewRequestParams,
} from '../utils/page-preview-params';

// Fetch page section details
export const useFetchPageSectionDetails = (id: string | number) => useQuery({
    queryKey: queryKeys.pageSection.details(id),
    queryFn: () => _PageSectionApi.getPageSectionDetails(id),
    enabled: !!id,
  });

// Fetch pages
export const useFetchPages = () => useQuery({
    queryKey: queryKeys.pageSection.pages(),
    queryFn: () => _PageSectionApi.getPages(),
  });

// Fetch page preview (sections layout for a CMS page)
export const useFetchPagePreview = (id: string | number, params?: PagePreviewQueryParams) => {
  const paramsKey = serializePagePreviewParams(params);

  return useQuery({
    queryKey: queryKeys.pageSection.pagePreview(id, paramsKey),
    queryFn: () => _PageSectionApi.getPagePreview(id, toPagePreviewRequestParams(params ?? {})),
    enabled: !!id,
    staleTime: 0,
  });
};

// Fetch sections (for section_id dropdown)
export const useFetchSectionsForDropdown = () => useQuery({
    queryKey: queryKeys.section.list({ page: 1, limit: 100 }),
    queryFn: () => _PageSectionApi.getSections(1, 100),
  });

// Fetch filter data from dynamic URL
export const useFetchFilterData = (url: string | null, params?: any) => useQuery({
    queryKey: ['filter-data', url, params],
    queryFn: () => _PageSectionApi.getFilterData(url!, params),
    enabled: !!url,
  });

// Update page section mutation
export const useUpdatePageSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: PageSectionUpdatePayload }) =>
      _PageSectionApi.updatePageSection(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pageSection', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['pageSection', 'details', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['pageSection', 'pagePreview'] });
      queryClient.invalidateQueries({ queryKey: ['pageBuilder'] });
    },
  });
};

// Reorder sections on a CMS page preview
export const useReorderPageSections = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pageId,
      sections,
    }: {
      pageId: string | number;
      sections: PageSectionReorderPayload['sections'];
    }) => _PageSectionApi.reorderPageSections(pageId, { sections }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['pageSection', 'pagePreview', variables.pageId],
      });
      queryClient.invalidateQueries({ queryKey: ['pageBuilder'] });
    },
  });
};

// Delete page section mutation
export const useDeletePageSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => _PageSectionApi.deletePageSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageSection'] });
      queryClient.invalidateQueries({ queryKey: ['pageBuilder'] });
    },
  });
};
