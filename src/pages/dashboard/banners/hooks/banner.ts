import type { BannerItem, BannerTextField, BannerFormValues, BannerListResponse } from '../types/banner.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import { isActiveLanguageArabic } from 'src/lib/language-code';

import { _BannerApi } from '../api/banner.services';

/** List cells are a localized string or null. `null` must not keep the previous text. */
function listText(value: BannerTextField | undefined): string | null {
  if (value == null || Array.isArray(value)) return null;
  if (typeof value === 'string') return value.trim() ? value : null;
  const text = isActiveLanguageArabic() ? value.ar : value.en;
  if (text == null) return null;
  const trimmed = text.trim();
  return trimmed || null;
}

function applyClearedBanner(item: BannerItem, updated: BannerItem): BannerItem {
  return {
    ...item,
    title: listText(updated.title),
    description: listText(updated.description),
    button_text: listText(updated.button_text),
    link: updated.link ?? null,
    expires_at: updated.expires_at ?? null,
    image_url: updated.image_url || item.image_url,
  };
}

export const useFetchBanners = (
  page: number = 1,
  perPage: number = 10,
  params?: { search?: string }
) =>
  useQuery({
    queryKey: queryKeys.banner.list({ page, per_page: perPage, ...params }),
    queryFn: () => _BannerApi.getListBanners({ page, per_page: perPage, ...params }),
  });

/** Live banner rows for the add-section picker. Same feed as the banners table. */
export const useInfiniteBanners = (search: string, options?: { enabled?: boolean }) => {
  const infiniteQuery = useInfiniteQuery({
    queryKey: ['banner', 'list', 'picker', search] as const,
    queryFn: ({ pageParam }) =>
      _BannerApi.getListBanners({
        page: pageParam,
        per_page: 20,
        ...(search ? { search } : {}),
      }),
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (!pagination) return undefined;
      return pagination.current_page < pagination.last_page
        ? pagination.current_page + 1
        : undefined;
    },
    initialPageParam: 1,
    enabled: options?.enabled ?? true,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const banners = infiniteQuery.data?.pages.flatMap((page) => page.data?.items ?? []) ?? [];

  return { infiniteQuery, banners };
};

export const useFetchBannerById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.banner.details(id),
    queryFn: () => _BannerApi.getBannerById(id),
    enabled: !!id,
  });

export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BannerFormValues) => _BannerApi.createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banner', 'list'] });
    },
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: BannerFormValues }) =>
      _BannerApi.updateBanner(id, data),
    onSuccess: (body: { data?: BannerItem } | BannerItem | undefined, variables) => {
      const updated =
        body && typeof body === 'object' && 'data' in body && body.data && !Array.isArray(body.data)
          ? body.data
          : (body as BannerItem | undefined);
      if (updated && typeof updated === 'object' && 'id' in updated) {
        queryClient.setQueryData(queryKeys.banner.details(variables.id), { status: true, data: updated });
        queryClient.setQueriesData<BannerListResponse>({ queryKey: ['banner', 'list'] }, (current) => {
          if (!current?.data?.items) return current;
          return {
            ...current,
            data: {
              ...current.data,
              items: current.data.items.map((item) =>
                String(item.id) === String(variables.id) ? applyClearedBanner(item, updated) : item
              ),
            },
          };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['banner', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.banner.details(variables.id) });
    },
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _BannerApi.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banner', 'list'] });
    },
  });
};
