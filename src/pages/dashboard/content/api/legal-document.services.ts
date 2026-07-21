import type {
  LegalDocumentListParams,
  LegalDocumentListResponse,
  LegalDocumentCreatePayload,
  LegalDocumentUpdatePayload,
  LegalDocumentDetailsResponse,
} from '../types/legal-document.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _LegalDocumentApi = {
  getList: async (params?: LegalDocumentListParams): Promise<LegalDocumentListResponse> => {
    const response = await axiosInstance.get<LegalDocumentListResponse>(
      apiRoutes.legalDocument.list,
      { params }
    );
    return response.data;
  },

  getById: async (id: number | string): Promise<LegalDocumentDetailsResponse> => {
    const response = await axiosInstance.get<LegalDocumentDetailsResponse>(
      apiRoutes.legalDocument.details(id)
    );
    return response.data;
  },

  create: async (data: LegalDocumentCreatePayload): Promise<LegalDocumentDetailsResponse> => {
    const response = await axiosInstance.post<LegalDocumentDetailsResponse>(
      apiRoutes.legalDocument.create,
      data
    );
    return response.data;
  },

  update: async (
    id: number | string,
    data: LegalDocumentUpdatePayload
  ): Promise<LegalDocumentDetailsResponse> => {
    const response = await axiosInstance.patch<LegalDocumentDetailsResponse>(
      apiRoutes.legalDocument.update(id),
      data
    );
    return response.data;
  },

  delete: async (id: number | string): Promise<{ status: boolean; message: string; data: boolean }> => {
    const response = await axiosInstance.delete<{ status: boolean; message: string; data: boolean }>(
      apiRoutes.legalDocument.delete(id)
    );
    return response.data;
  },
};
