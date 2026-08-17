import type {
  PageBuilderListItem,
  PageBuilderListResponse,
  PageCreateUpdatePayload,
  PageBuilderDetailsResponse,
  PageBuilderListQueryParams,
  UnifiedSectionCreatePayload,
} from '../types/page-builder.types';

import { apiRoutes, axiosInstance } from '@/api';

/** Normalizes list payloads that may arrive as a plain array instead of `{ items, pagination }`. */
function normalizeListResponse(raw: any): PageBuilderListResponse {
  const data = raw?.data;
  const items: PageBuilderListItem[] = Array.isArray(data) ? data : (data?.items ?? []);
  const pagination = (!Array.isArray(data) && data?.pagination) || {
    current_page: 1,
    last_page: 1,
    per_page: items.length,
    total: items.length,
  };
  return {
    status: Boolean(raw?.status),
    message: String(raw?.message ?? ''),
    data: { items, pagination },
  };
}

export const _PageBuilderApi = {
  getListPages: async (params?: PageBuilderListQueryParams): Promise<PageBuilderListResponse> => {
    const response = await axiosInstance.get(apiRoutes.pageBuilder.list, {
      // The Pages screen falls back to the legacy feed on failure and renders its own notice.
      skipErrorToast: true,
      params: {
        page: params?.page ?? 1,
        per_page: params?.per_page ?? 25,
        ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
        ...(params?.sort_field ? { sort_field: params.sort_field } : {}),
        ...(params?.sort_order ? { sort_order: params.sort_order } : {}),
      },
    });
    return normalizeListResponse(response.data);
  },

  getPageDetails: async (id: number | string): Promise<PageBuilderDetailsResponse> => {
    const response = await axiosInstance.get<PageBuilderDetailsResponse>(
      apiRoutes.pageBuilder.details(id)
    );
    return response.data;
  },

  createPage: async (data: PageCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.pageBuilder.create, data);
    return response.data;
  },

  updatePage: async (id: number | string, data: PageCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.pageBuilder.update(id), data);
    return response.data;
  },

  deletePage: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.pageBuilder.delete(id));
    return response.data;
  },

  /** One call: creates the Section and links it to the page. Returns the created link (AdminOneResource). */
  addSection: async (pageId: number | string, data: UnifiedSectionCreatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.pageBuilder.addSection(pageId), data);
    return response.data;
  },
};
