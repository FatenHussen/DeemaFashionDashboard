import type {
  ItemTypesResponse,
  SectionListResponse,
  SectionListQueryParams,
  SectionDetailsResponse,
  SectionCreateUpdatePayload,
} from '../types/section.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _SectionApi = {
  getListSections: async (params?: SectionListQueryParams): Promise<SectionListResponse> => {
    const response = await axiosInstance.get<SectionListResponse>(apiRoutes.section.list, {
      params: {
        page: params?.page ?? 1,
        per_page: params?.per_page ?? 25,
        ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
        ...(params?.content_type ? { content_type: params.content_type } : {}),
        ...(params?.type ? { type: params.type } : {}),
        ...(params?.is_active != null ? { is_active: params.is_active } : {}),
        ...(params?.category_id != null && params.category_id > 0
          ? { category_id: params.category_id }
          : {}),
      },
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
