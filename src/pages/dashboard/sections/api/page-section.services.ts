import type {
  PagePreviewResponse,
  PagePreviewQueryParams,
  PageSectionReorderPayload,
  PageSectionReorderResponse,
} from '../types/page-preview.types';
import type {
  PagesResponse,
  DisplayTypesResponse,
  SectionsListResponse,
  PageSectionListResponse,
  PageSectionUpdatePayload,
  PageSectionDetailsResponse,
  PageSectionCreateUpdatePayload,
} from '../types/page-section.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _PageSectionApi = {
  getListPageSections: async (
    page: number = 1,
    perPage: number = 25,
    search?: string
  ): Promise<PageSectionListResponse> => {
    const response = await axiosInstance.get<PageSectionListResponse>(apiRoutes.pageSection.list, {
      params: { page, per_page: perPage, ...(search?.trim() ? { search: search.trim() } : {}) },
    });
    return response.data;
  },

  getPageSectionDetails: async (id: number | string): Promise<PageSectionDetailsResponse> => {
    const response = await axiosInstance.get<PageSectionDetailsResponse>(
      apiRoutes.pageSection.details(id)
    );
    return response.data;
  },

  createPageSection: async (data: PageSectionCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.pageSection.create, data);
    return response.data;
  },

  /** `PUT` (not `PATCH`) is what the backend route accepts. Send only the changed keys. */
  updatePageSection: async (
    id: number | string,
    data: PageSectionUpdatePayload
  ): Promise<any> => {
    const response = await axiosInstance.put(apiRoutes.pageSection.update(id), data);
    return response.data;
  },

  deletePageSection: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.pageSection.delete(id));
    return response.data;
  },

  getPages: async (): Promise<PagesResponse> => {
    const response = await axiosInstance.get<PagesResponse>(apiRoutes.pageSection.pages);
    return response.data;
  },

  getPagePreview: async (
    id: number | string,
    params?: PagePreviewQueryParams
  ): Promise<PagePreviewResponse> => {
    const response = await axiosInstance.get<PagePreviewResponse>(
      apiRoutes.pageSection.pagePreview(id),
      { params }
    );
    return response.data;
  },

  reorderPageSections: async (
    pageId: number | string,
    payload: PageSectionReorderPayload
  ): Promise<PageSectionReorderResponse> => {
    const response = await axiosInstance.post<PageSectionReorderResponse>(
      apiRoutes.pageSection.pageReorder(pageId),
      payload
    );
    return response.data;
  },

  getSections: async (page: number = 1, perPage: number = 100): Promise<SectionsListResponse> => {
    const response = await axiosInstance.get<SectionsListResponse>(apiRoutes.section.list, {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  getFilterData: async (url: string, params?: any): Promise<any> => {
    const response = await axiosInstance.get(url, { params });
    return response.data;
  },

  getDisplayTypes: async (params?: {
    manual_model?: string;
    page_id?: number | string;
  }): Promise<DisplayTypesResponse> => {
    const response = await axiosInstance.get<DisplayTypesResponse>(
      apiRoutes.pageSection.displayTypes,
      {
        params: {
          ...(params?.manual_model ? { manual_model: params.manual_model } : {}),
          ...(params?.page_id != null && String(params.page_id).trim() !== ''
            ? { page_id: params.page_id }
            : {}),
        },
      }
    );
    return response.data;
  },
};
