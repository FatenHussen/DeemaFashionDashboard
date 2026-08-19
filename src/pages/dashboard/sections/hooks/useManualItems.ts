import type { ItemTypeEntry, ManualItemsListResponse } from '../types/section.types';

import { useMemo } from 'react';
import { queryKeys, axiosInstance } from '@/api';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

import { _SectionApi } from '../api/section.services';

export const useFetchSectionItemTypes = () =>
  useQuery({
    queryKey: queryKeys.section.itemTypes(),
    queryFn: () => _SectionApi.getSectionItemTypes(),
  });

interface ManualItemsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useFetchManualItems = (
  manualModel: string | null | undefined,
  params: ManualItemsParams = {}
) => {
  const { page = 1, limit = 25, search } = params;

  // Fetch item types map
  const itemTypesQuery = useFetchSectionItemTypes();

  // Resolve URL from the item types map
  const url = useMemo(() => {
    if (!manualModel || !itemTypesQuery.data?.data) {
      return null;
    }

    const entry = itemTypesQuery.data.data[manualModel];

    // If entry is missing or is an array, treat as invalid
    if (!entry || Array.isArray(entry)) {
      return null;
    }

    const itemTypeEntry = entry as ItemTypeEntry;
    return itemTypeEntry.url || null;
  }, [manualModel, itemTypesQuery.data]);

  // Fetch manual items list using the resolved URL
  const itemsQuery = useQuery({
    queryKey: queryKeys.section.manualItems(manualModel || '', url || '', { page, limit, search }),
    queryFn: async () => {
      if (!url) {
        throw new Error('Invalid manual model or URL not found');
      }

      const response = await axiosInstance.get<ManualItemsListResponse>(url, {
        params: { page, limit, search },
      });
      return response.data;
    },
    enabled: !!url && !!manualModel,
  });

  return {
    itemTypesQuery,
    itemsQuery,
    url,
  };
};

interface InfiniteManualItemsParams {
  limit?: number;
  search?: string;
  /** Extra query params forwarded to the items list API (e.g. category_id for products). */
  listFilters?: Record<string, unknown>;
}

/** Explicit items feed (URL + fixed params) that bypasses the `item-types` map. */
export interface ManualItemsSource {
  url: string;
  params?: Record<string, unknown>;
}

export const useInfiniteManualItems = (
  manualModel: string | null | undefined,
  params: InfiniteManualItemsParams = {},
  source?: ManualItemsSource
) => {
  const { limit = 10, search, listFilters } = params;

  const itemTypesQuery = useFetchSectionItemTypes();

  const url = useMemo(() => {
    if (source?.url) return source.url;
    if (!manualModel || !itemTypesQuery.data?.data) return null;
    const entry = itemTypesQuery.data.data[manualModel];
    if (!entry || Array.isArray(entry)) return null;
    return (entry as ItemTypeEntry).url || null;
  }, [source?.url, manualModel, itemTypesQuery.data]);

  const mergedListParams = useMemo(
    () => ({ ...source?.params, ...listFilters }),
    [source?.params, listFilters]
  );

  const infiniteQuery = useInfiniteQuery({
    queryKey: [
      'section',
      'manual-items',
      'infinite',
      manualModel,
      url,
      { limit, search, ...mergedListParams },
    ],
    queryFn: async ({ pageParam }) => {
      if (!url) throw new Error('Invalid manual model or URL not found');
      const response = await axiosInstance.get<ManualItemsListResponse>(url, {
        // `per_page` mirrors `limit` for admin list endpoints used as explicit sources.
        params: { page: pageParam, limit, per_page: limit, search, ...mergedListParams },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (!pagination) return undefined;
      return pagination.current_page < pagination.last_page
        ? pagination.current_page + 1
        : undefined;
    },
    initialPageParam: 1,
    enabled: !!url && !!manualModel,
  });

  const allItems = infiniteQuery.data?.pages.flatMap((page) => page.data?.items ?? []) ?? [];

  return {
    itemTypesQuery,
    infiniteQuery,
    allItems,
    url,
  };
};
