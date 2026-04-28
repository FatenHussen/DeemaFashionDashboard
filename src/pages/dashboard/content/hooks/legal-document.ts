import type { LegalDocumentUpdatePayload } from '../types/legal-document.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _LegalDocumentApi } from '../api/legal-document.services';

export const useFetchLegalDocuments = (
  page: number = 1,
  perPage: number = 10,
  params?: { search?: string }
) =>
  useQuery({
    queryKey: queryKeys.legalDocument.list({ page, per_page: perPage, ...params }),
    queryFn: () => _LegalDocumentApi.getList({ page, per_page: perPage, ...params }),
  });

export const useFetchLegalDocumentById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.legalDocument.details(id),
    queryFn: () => _LegalDocumentApi.getById(id),
    enabled: !!id,
  });

export const useUpdateLegalDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: LegalDocumentUpdatePayload }) =>
      _LegalDocumentApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['legalDocument', 'list'] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.legalDocument.details(variables.id),
      });
    },
  });
};
