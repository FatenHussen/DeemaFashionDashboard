import type { IconListResponse, IconCreatePayload, IconDetailsResponse } from '../types/icon.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _IconApi } from '../api/icon.services';
import { iconPreviewUrl, iconImageWasReplaced } from '../utils/icon-artwork';

export const useFetchIcons = (
  page: number = 1,
  perPage: number = 10,
  params?: { search?: string; is_active?: number }
) =>
  useQuery({
    queryKey: queryKeys.icon.list({ page, per_page: perPage, ...params }),
    queryFn: () => _IconApi.getListIcons({ page, per_page: perPage, ...params }),
  });

export const useFetchIconById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.icon.details(id),
    queryFn: () => _IconApi.getIconById(id),
    enabled: !!id,
  });

export const useCreateIcon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IconCreatePayload) => _IconApi.createIcon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['icon', 'list'] });
    },
  });
};

export const useUpdateIcon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<IconCreatePayload> }) =>
      _IconApi.updateIcon(id, data),
    onSuccess: (body: { data?: { image?: string | null; icon?: string | null } } | undefined, variables) => {
      const nextUrl = body?.data?.image || body?.data?.icon || '';
      const cached = queryClient.getQueryData<IconDetailsResponse>(queryKeys.icon.details(variables.id));
      const previousUrl = cached?.data?.image || cached?.data?.icon || '';
      const sentFile = variables.data.image instanceof File;
      // A new path or a new `?v=` means the uploaded image was stored.
      const src =
        !sentFile || iconImageWasReplaced(previousUrl, nextUrl, true)
          ? iconPreviewUrl(nextUrl)
          : null;
      if (src) {
        queryClient.setQueryData(
          queryKeys.icon.details(variables.id),
          (current: IconDetailsResponse | undefined) => {
            if (!current?.data) return current;
            return {
              ...current,
              data: { ...current.data, image: src, icon: src },
            };
          }
        );
        queryClient.setQueriesData<IconListResponse>({ queryKey: ['icon', 'list'] }, (current) => {
          if (!current?.data?.items) return current;
          return {
            ...current,
            data: {
              ...current.data,
              items: current.data.items.map((item) =>
                String(item.id) === String(variables.id) ? { ...item, image: src, icon: src } : item
              ),
            },
          };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['icon', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.icon.details(variables.id) });
    },
  });
};

export const useDeleteIcon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _IconApi.deleteIcon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['icon', 'list'] });
    },
  });
};
