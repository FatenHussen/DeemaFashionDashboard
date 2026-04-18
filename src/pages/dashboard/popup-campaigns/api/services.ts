import type { PopupCampaignListResponse, PopupCampaignDetailResponse } from '../types';

import { apiRoutes, axiosInstance } from '@/api';

function normalizeListPayload(body: any): PopupCampaignListResponse['data'] {
  const inner = body?.data;
  let items: PopupCampaignListResponse['data']['items'] = [];
  let pagination: PopupCampaignListResponse['data']['pagination'] = {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  };

  if (inner?.data && Array.isArray(inner.data)) {
    items = inner.data;
    pagination = inner.pagination ?? pagination;
  } else if (inner?.items) {
    items = inner.items;
    pagination = inner.pagination ?? pagination;
  } else if (Array.isArray(inner)) {
    items = inner;
  }

  return { items, pagination };
}

export const _PopupCampaignApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    sort_field?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<PopupCampaignListResponse> => {
    const response = await axiosInstance.get<PopupCampaignListResponse>(
      apiRoutes.popupCampaign.list,
      { params }
    );
    const body = response.data as any;
    return {
      status: body.status,
      message: body.message,
      data: normalizeListPayload(body),
    };
  },

  getById: async (id: number | string): Promise<PopupCampaignDetailResponse> => {
    const response = await axiosInstance.get<PopupCampaignDetailResponse>(
      apiRoutes.popupCampaign.details(id)
    );
    return response.data;
  },

  create: async (formData: FormData): Promise<PopupCampaignDetailResponse> => {
    const response = await axiosInstance.post<PopupCampaignDetailResponse>(
      apiRoutes.popupCampaign.create,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  update: async (
    id: number | string,
    formData: FormData
  ): Promise<PopupCampaignDetailResponse> => {
    const response = await axiosInstance.put<PopupCampaignDetailResponse>(
      apiRoutes.popupCampaign.update(id),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  delete: async (id: number | string): Promise<{ status: boolean; data: boolean }> => {
    const response = await axiosInstance.delete(apiRoutes.popupCampaign.delete(id));
    return response.data;
  },
};
