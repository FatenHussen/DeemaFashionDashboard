import type { PopupCampaignUpsertPayload } from '../types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _PopupCampaignApi } from '../api/services';

export const useFetchPopupCampaigns = (
  page: number = 1,
  perPage: number = 10,
  search?: string,
  sort?: { sort_field?: string; sort_order?: 'asc' | 'desc' }
) =>
  useQuery({
    queryKey: queryKeys.popupCampaign.list({
      page,
      per_page: perPage,
      search: search?.trim() || undefined,
      ...sort,
    }),
    queryFn: () =>
      _PopupCampaignApi.getList({
        page,
        per_page: perPage,
        search: search?.trim() || undefined,
        ...sort,
      }),
  });

export const useFetchPopupCampaignById = (id: number | string | undefined, enabled = true) =>
  useQuery({
    queryKey: queryKeys.popupCampaign.details(id ?? ''),
    queryFn: () => _PopupCampaignApi.getById(id!),
    enabled: Boolean(enabled && id != null && String(id).length > 0),
  });

export const useCreatePopupCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      fields,
      mediaFile,
    }: {
      fields: PopupCampaignUpsertPayload;
      mediaFile: File;
    }) => _PopupCampaignApi.create(fields, mediaFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popupCampaign', 'list'] });
    },
  });
};

export const useUpdatePopupCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      fields,
      mediaFile,
    }: {
      id: number | string;
      fields: PopupCampaignUpsertPayload;
      mediaFile?: File | null;
    }) => _PopupCampaignApi.update(id, fields, mediaFile),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['popupCampaign', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.popupCampaign.details(variables.id) });
    },
  });
};

export const useDeletePopupCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _PopupCampaignApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popupCampaign', 'list'] });
    },
  });
};
