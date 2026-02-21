import type {
  UserListResponse,
  UserDetailsResponse,
  UserCreatePayload,
  UserUpdatePayload,
  UserConvertAffiliatePayload,
} from '../types/user.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _UserApi = {
  getListUsers: async (params?: {
    page?: number;
    per_page?: number;
    is_affiliate?: number;
    affiliate_approved?: number;
    area_id?: number;
  }): Promise<UserListResponse> => {
    const response = await axiosInstance.get<UserListResponse>(apiRoutes.user.list, {
      params,
    });
    return response.data;
  },

  getUserById: async (id: number | string): Promise<UserDetailsResponse> => {
    const response = await axiosInstance.get<UserDetailsResponse>(
      apiRoutes.user.details(id)
    );
    return response.data;
  },

  createUser: async (data: UserCreatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.user.create, data);
    return response.data;
  },

  updateUser: async (
    id: number | string,
    data: UserUpdatePayload
  ): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.user.update(id), data);
    return response.data;
  },

  convertToAffiliate: async (
    id: number | string,
    data: UserConvertAffiliatePayload
  ): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.user.update(id), data);
    return response.data;
  },

  deleteUser: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.user.delete(id));
    return response.data;
  },
};
