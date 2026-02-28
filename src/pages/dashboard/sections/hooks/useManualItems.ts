import type { ItemTypeEntry, ManualItemsListResponse } from '../types/section.types';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys, axiosInstance } from '@/api';

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
