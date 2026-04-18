import type {
  UserListResponse,
  UserCreatePayload,
  UserUpdatePayload,
  UserDetailsResponse,
  UserReactivateAffiliatePayload,
} from '../types/user.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _UserApi = {
  getListUsers: async (params?: {
    page?: number;
    per_page?: number;
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
    const response = await axiosInstance.put(apiRoutes.user.update(id), data);
    return response.data;
  },

  reactivateAffiliate: async (
    id: number | string,
    data: UserReactivateAffiliatePayload
  ): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.user.reactivateAffiliate(id), data);
    return response.data;
  },

  demoteAffiliate: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.user.demoteAffiliate(id));
    return response.data;
  },

  deleteUser: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.user.delete(id));
    return response.data;
  },
};
