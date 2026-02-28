import type {
  LegalDocumentListResponse,
  LegalDocumentUpdatePayload,
  LegalDocumentDetailsResponse,
} from '../types/legal-document.types';

import { apiRoutes, axiosInstance } from '@/api';

export const _LegalDocumentApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
  }): Promise<LegalDocumentListResponse> => {
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
};
