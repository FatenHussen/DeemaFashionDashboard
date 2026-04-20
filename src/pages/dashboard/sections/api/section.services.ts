import type {
  ItemTypesResponse,
  SectionListResponse,
  SectionDetailsResponse,
  SectionCreateUpdatePayload,
} from '../types/section.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _SectionApi = {
  getListSections: async (
    page: number = 1,
    perPage: number = 25,
    search?: string
  ): Promise<SectionListResponse> => {
    const response = await axiosInstance.get<SectionListResponse>(apiRoutes.section.list, {
      params: { page, per_page: perPage, ...(search?.trim() ? { search: search.trim() } : {}) },
    });
    return response.data;
  },

  getSectionDetails: async (id: number | string): Promise<SectionDetailsResponse> => {
    const response = await axiosInstance.get<SectionDetailsResponse>(
      apiRoutes.section.details(id)
    );
    return response.data;
  },

  createSection: async (data: SectionCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.section.create, data);
    return response.data;
  },

  updateSection: async (
    id: number | string,
    data: SectionCreateUpdatePayload
  ): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.section.update(id), data);
    return response.data;
  },

  deleteSection: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.section.delete(id));
    return response.data;
  },

  getSectionItemTypes: async (): Promise<ItemTypesResponse> => {
    const response = await axiosInstance.get<ItemTypesResponse>(apiRoutes.section.itemTypes);
    return response.data;
  },
};
