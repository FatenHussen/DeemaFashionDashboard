import type { BannerFormValues } from '../types/banner.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _BannerApi } from '../api/banner.services';

export const useFetchBanners = (page: number = 1, perPage: number = 10) =>
  useQuery({
    queryKey: queryKeys.banner.list({ page, per_page: perPage }),
    queryFn: () => _BannerApi.getListBanners({ page, per_page: perPage }),
  });

export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BannerFormValues) => _BannerApi.createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banner.list() });
    },
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: BannerFormValues }) =>
      _BannerApi.updateBanner(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banner.list() });
    },
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => _BannerApi.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banner.list() });
    },
  });
};
