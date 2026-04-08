import type {
  ColorCreatePayload,
  ColorDetailsResponse,
  ColorListParams,
  ColorListResponse,
} from '../types/color.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _ColorApi = {
  getListColors: async (params?: ColorListParams): Promise<ColorListResponse> => {
    const response = await axiosInstance.get<ColorListResponse>(apiRoutes.color.list, {
      params: {
        page: params?.page,
        per_page: params?.per_page,
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.sort_field ? { sort_field: params.sort_field } : {}),
        ...(params?.sort_order ? { sort_order: params.sort_order } : {}),
        ...(params?.hex ? { hex: params.hex } : {}),
        ...(params?.is_active !== undefined ? { is_active: params.is_active } : {}),
      },
    });
    return response.data;
  },

  getColorById: async (id: number | string): Promise<ColorDetailsResponse> => {
    const response = await axiosInstance.get<ColorDetailsResponse>(apiRoutes.color.details(id));
    return response.data;
  },

  createColor: async (data: ColorCreatePayload): Promise<unknown> => {
    const response = await axiosInstance.post(apiRoutes.color.create, data);
    return response.data;
  },

  updateColor: async (
    id: number | string,
    data: Partial<ColorCreatePayload>
  ): Promise<unknown> => {
    const response = await axiosInstance.patch(apiRoutes.color.update(id), data);
    return response.data;
  },

  deleteColor: async (id: number | string): Promise<unknown> => {
    const response = await axiosInstance.delete(apiRoutes.color.delete(id));
    return response.data;
  },
};
