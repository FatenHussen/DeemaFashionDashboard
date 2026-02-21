import type {
  ComplaintListResponse,
  ComplaintDetailsResponse,
  ComplaintUpdatePayload,
} from '../types/complaint.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _ComplaintApi = {
  getListComplaints: async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    user_id?: number;
  }): Promise<ComplaintListResponse> => {
    const response = await axiosInstance.get<ComplaintListResponse>(apiRoutes.complaint.list, {
      params,
    });
    return response.data;
  },

  getComplaintById: async (id: number | string): Promise<ComplaintDetailsResponse> => {
    const response = await axiosInstance.get<ComplaintDetailsResponse>(
      apiRoutes.complaint.details(id)
    );
    return response.data;
  },

  updateComplaint: async (
    id: number | string,
    data: ComplaintUpdatePayload
  ): Promise<any> => {
    const response = await axiosInstance.patch(apiRoutes.complaint.update(id), data);
    return response.data;
  },
};
