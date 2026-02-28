import { useInfiniteQuery } from '@tanstack/react-query';

// ----------------------------------------------------------------------

export interface InfiniteSelectOption {
  id: number;
  label: string;
}

interface PaginatedSelectResponse {
  data: {
    items: InfiniteSelectOption[];
    pagination: {
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
  fetcher: (page: number) => Promise<PaginatedSelectResponse>
) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetcher(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.data.pagination;
      return current_page < last_page ? current_page + 1 : undefined;
    },
  });

  const allItems: InfiniteSelectOption[] =
    query.data?.pages.flatMap((p) => p.data.items) ?? [];

  return {
    ...query,
    allItems,
  };
}
