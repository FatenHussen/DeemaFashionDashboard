import type {
  PageSectionCreateUpdatePayload,
} from '../types/page-section.types';

import { queryKeys } from '@/api/queryKeys';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _PageSectionApi } from '../api/page-section.services';

// Fetch list of page sections
export const useFetchPageSections = (page: number = 1, limit: number = 25, search?: string) => useQuery({
    queryKey: queryKeys.pageSection.list({ page, limit, search }),
    queryFn: () => _PageSectionApi.getListPageSections(page, limit, search),
  });

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

// Fetch display types
export const useFetchDisplayTypes = (manualModel?: string, pageId?: string | number) => useQuery({
    queryKey: [...queryKeys.pageSection.displayTypes(), manualModel ?? '', String(pageId ?? '')],
    queryFn: () => _PageSectionApi.getDisplayTypes(manualModel, pageId),
  });

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

// Create page section mutation
export const useCreatePageSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PageSectionCreateUpdatePayload) => _PageSectionApi.createPageSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageSection', 'list'] });
    },
  });
};

// Update page section mutation
export const useUpdatePageSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: PageSectionCreateUpdatePayload }) =>
      _PageSectionApi.updatePageSection(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pageSection', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['pageSection', 'details', variables.id] });
    },
  });
};

// Delete page section mutation
export const useDeletePageSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => _PageSectionApi.deletePageSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageSection', 'list'] });
    },
  });
};
