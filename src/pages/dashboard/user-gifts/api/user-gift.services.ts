import type {
  UserGiftListResponse,
  UserGiftCreatePayload,
  UserGiftUpdatePayload,
  UserGiftDetailsResponse,
} from '../types/user-gift.types';

import { apiRoutes, axiosInstance } from '@/api';

export type UserGiftListParams = {
  page?: number;
  per_page?: number;
  user_id?: number;
  gift_id?: number;
  status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
};

export const _UserGiftApi = {
  getListUserGifts: async (
    params?: UserGiftListParams
  ): Promise<UserGiftListResponse> => {
    const response = await axiosInstance.get<UserGiftListResponse>(
      apiRoutes.userGift.list,
      { params }
    );
    return response.data;
  },

  getUserGiftById: async (
    id: number | string
  ): Promise<UserGiftDetailsResponse> => {
    const response = await axiosInstance.get<UserGiftDetailsResponse>(
      apiRoutes.userGift.details(id)
    );
    return response.data;
  },

  createUserGift: async (
    data: UserGiftCreatePayload
  ): Promise<UserGiftDetailsResponse> => {
    const response = await axiosInstance.post(
      apiRoutes.userGift.create,
      data
    );
    return response.data;
  },

  updateUserGift: async (
    id: number | string,
    data: UserGiftUpdatePayload
  ): Promise<UserGiftDetailsResponse> => {
    const response = await axiosInstance.put(
      apiRoutes.userGift.update(id),
      data
    );
    return response.data;
  },

  deleteUserGift: async (id: number | string): Promise<{ status: boolean; message: string }> => {
    const response = await axiosInstance.delete(apiRoutes.userGift.delete(id));
    return response.data;
  },
};
