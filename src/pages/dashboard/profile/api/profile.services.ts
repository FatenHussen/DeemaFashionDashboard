import { axiosInstance, apiRoutes } from '@/api';

export type ProfileData = {
  id: number;
  name: string;
  email: string;
  is_active: number;
  roles: string[];
  created_at: string;
};

export type ProfileResponse = {
  status: boolean;
  message: string;
  data: ProfileData;
};

export const _ProfileApi = {
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await axiosInstance.get<ProfileResponse>(apiRoutes.auth.profile);
    return response.data;
  },
};

