import type {
  PagesResponse,
  SectionsListResponse,
  PageSectionListResponse,
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

  updatePageSection: async (
    id: number | string,
    data: PageSectionCreateUpdatePayload
  ): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.pageSection.update(id), data);
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
};
