import type {
  QuickActionListResponse,
  QuickActionDetailResponse,
} from '../types';

import { apiRoutes, axiosInstance } from '@/api';

function normalizeListPayload(body: any): QuickActionListResponse['data'] {
  const inner = body?.data;
  let items: QuickActionListResponse['data']['items'] = [];
  let pagination: QuickActionListResponse['data']['pagination'] = {
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

export const _QuickActionApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    sort_field?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<QuickActionListResponse> => {
    const response = await axiosInstance.get<QuickActionListResponse>(apiRoutes.quickAction.list, {
      params,
    });
    const body = response.data as any;
    return {
      status: body.status,
      message: body.message,
      data: normalizeListPayload(body),
    };
  },

  getById: async (id: number | string): Promise<QuickActionDetailResponse> => {
    const response = await axiosInstance.get<QuickActionDetailResponse>(
      apiRoutes.quickAction.details(id)
    );
    return response.data;
  },

  create: async (formData: FormData): Promise<QuickActionDetailResponse> => {
    const response = await axiosInstance.post<QuickActionDetailResponse>(
      apiRoutes.quickAction.create,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  update: async (id: number | string, formData: FormData): Promise<QuickActionDetailResponse> => {
    const response = await axiosInstance.put<QuickActionDetailResponse>(
      apiRoutes.quickAction.update(id),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  delete: async (id: number | string): Promise<{ status: boolean; data: boolean }> => {
    const response = await axiosInstance.delete(apiRoutes.quickAction.delete(id));
    return response.data;
  },
};
