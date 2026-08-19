import type {
  PageCreateUpdatePayload,
  SliderLibraryQueryParams,
  PageBuilderListQueryParams,
  UnifiedSectionCreatePayload,
} from '../types/page-builder.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import { _PageBuilderApi } from '../api/page-builder.services';

export const useFetchPageBuilderPages = (params?: PageBuilderListQueryParams) =>
  useQuery({
    queryKey: queryKeys.pageBuilder.list(params),
    queryFn: () => _PageBuilderApi.getListPages(params),
  });

export const useFetchPageBuilderPage = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.pageBuilder.details(id),
    queryFn: () => _PageBuilderApi.getPageDetails(id),
    enabled: !!id,
  });

/** Invalidates both the new paginated list and the legacy pages dropdown feed. */
function invalidatePageCaches(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['pageBuilder', 'list'] });
  queryClient.invalidateQueries({ queryKey: queryKeys.pageSection.pages() });
}

export const useCreatePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PageCreateUpdatePayload) => _PageBuilderApi.createPage(data),
    onSuccess: () => invalidatePageCaches(queryClient),
  });
};

export const useUpdatePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: PageCreateUpdatePayload }) =>
      _PageBuilderApi.updatePage(id, data),
    onSuccess: (_, variables) => {
      invalidatePageCaches(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.pageBuilder.details(variables.id) });
    },
  });
};

export const useDeletePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _PageBuilderApi.deletePage(id),
    onSuccess: () => invalidatePageCaches(queryClient),
  });
};

/** Infinite scroll over every existing section (the "add section to page" picker). */
export const useInfinitePageSliders = (
  pageId: number | string,
  params?: Omit<SliderLibraryQueryParams, 'page'>
) => {
  const infiniteQuery = useInfiniteQuery({
    queryKey: queryKeys.pageBuilder.sliders(pageId, params),
    queryFn: ({ pageParam }) =>
      _PageBuilderApi.getPageSliders(pageId, { ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (!pagination) return undefined;
      return pagination.current_page < pagination.last_page
        ? pagination.current_page + 1
        : undefined;
    },
    initialPageParam: 1,
    enabled: !!pageId,
  });

  const allSliders = infiniteQuery.data?.pages.flatMap((page) => page.data?.items ?? []) ?? [];

  return { infiniteQuery, allSliders };
};

/** Unified create: one call builds the section and links it to the page. */
export const useAddSectionToPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pageId,
      data,
    }: {
      pageId: number | string;
      data: UnifiedSectionCreatePayload;
    }) => _PageBuilderApi.addSection(pageId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pageBuilder.details(variables.pageId) });
      queryClient.invalidateQueries({ queryKey: ['pageBuilder', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['pageSection', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['pageSection', 'pagePreview', variables.pageId] });
      queryClient.invalidateQueries({ queryKey: ['section', 'list'] });
    },
  });
};
