import type {
  ContactMethodDetailsResponse,
  ContactMethodListResponse,
  ContactMethodMutationPayload,
} from '../types/contact-method.types';

import { apiRoutes, axiosInstance } from '@/api';

const multipartHeaders = { 'Content-Type': 'multipart/form-data' as const };

function buildFormData(data: ContactMethodMutationPayload): FormData {
  const fd = new FormData();
  fd.append('type', data.type);
  fd.append('value', data.value);
  if (data.icon instanceof File) {
    fd.append('icon', data.icon);
  }
  return fd;
}

export const _ContactMethodApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    sort_field?: string;
    sort_order?: string;
  }): Promise<ContactMethodListResponse> => {
    const response = await axiosInstance.get<ContactMethodListResponse>(
      apiRoutes.contactMethod.list,
      { params }
    );
    return response.data;
  },

  getById: async (id: number | string): Promise<ContactMethodDetailsResponse> => {
    const response = await axiosInstance.get<ContactMethodDetailsResponse>(
      apiRoutes.contactMethod.details(id)
    );
    return response.data;
  },

  create: async (data: ContactMethodMutationPayload): Promise<ContactMethodDetailsResponse> => {
    const response = await axiosInstance.post<ContactMethodDetailsResponse>(
      apiRoutes.contactMethod.create,
      buildFormData(data),
      { headers: multipartHeaders }
    );
    return response.data;
  },

  update: async (
    id: number | string,
    data: ContactMethodMutationPayload
  ): Promise<ContactMethodDetailsResponse> => {
    const fd = buildFormData(data);
    fd.append('_method', 'PUT');
    const response = await axiosInstance.post<ContactMethodDetailsResponse>(
      apiRoutes.contactMethod.update(id),
      fd,
      { headers: multipartHeaders }
    );
    return response.data;
  },

  delete: async (id: number | string): Promise<void> => {
    await axiosInstance.delete(apiRoutes.contactMethod.delete(id));
  },
};
