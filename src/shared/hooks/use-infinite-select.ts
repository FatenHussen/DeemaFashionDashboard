import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

// ----------------------------------------------------------------------

export interface InfiniteSelectOption {
  id: number;
  label: string;
  /** Category tree depth for indented list rows (optional). */
  depth?: number;
  /** True when the category has subcategories (folder icon in list). */
  hasChildren?: boolean;
}

interface PaginatedSelectResponse {
  data: {
    items: InfiniteSelectOption[];
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

/**
 * Generic infinite-scroll hook for select dropdowns.
 *
 * Usage:
 *   const { allItems, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
 *     useInfiniteSelect(
 *       ['shopProductVariant', 'list'],
 *       (page) => _ShopProductVariantApi.getList({ page, per_page: 10 })
 *     );
 */
export function useInfiniteSelect(
  queryKey: (string | number | undefined | null)[],
  fetcher: (page: number, limit: number) => Promise<PaginatedSelectResponse>,
  pageSize = 10
) {
  const query = useInfiniteQuery({
    queryKey,
    staleTime: 0,
    queryFn: ({ pageParam }) => fetcher(pageParam as number, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (!pagination) return undefined;
      const { current_page, last_page } = pagination;
      return current_page < last_page ? current_page + 1 : undefined;
    },
  });

  /** Stabilize reference when `query.data` is unchanged — avoids effect loops in consumers. */
  const allItems: InfiniteSelectOption[] = useMemo(
    () => query.data?.pages.flatMap((p) => p?.data?.items ?? []) ?? [],
    [query.data]
  );

  return {
    ...query,
    allItems,
  };
}
