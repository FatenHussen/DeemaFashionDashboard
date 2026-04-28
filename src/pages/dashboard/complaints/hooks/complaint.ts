import type { ComplaintUpdatePayload } from '../types/complaint.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _ComplaintApi } from '../api/complaint.services';

export const useFetchComplaints = (
  page: number = 1,
  perPage: number = 10,
  params?: { status?: string; user_id?: number; search?: string }
) =>
  useQuery({
    queryKey: queryKeys.complaint.list({ page, per_page: perPage, ...params }),
    queryFn: () =>
      _ComplaintApi.getListComplaints({ page, per_page: perPage, ...params }),
  });

export const useFetchComplaintById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.complaint.details(id),
    queryFn: () => _ComplaintApi.getComplaintById(id),
    enabled: !!id,
  });

export const useUpdateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: ComplaintUpdatePayload;
    }) => _ComplaintApi.updateComplaint(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complaint', 'list'] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.complaint.details(variables.id),
      });
    },
  });
};
