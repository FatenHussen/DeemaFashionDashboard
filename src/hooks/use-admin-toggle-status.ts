import type { AdminToggleStatusPayload } from '@/api/admin-toggle-status.types';

import { apiRoutes, axiosInstance } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ADMIN_TOGGLE_QUERY_ROOT } from '@/api/admin-toggle-invalidate';

export function useAdminToggleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminToggleStatusPayload) =>
      axiosInstance.post(apiRoutes.admin.toggleStatus, payload).then((res) => res.data),
    onSuccess: (_data, variables) => {
      const root = ADMIN_TOGGLE_QUERY_ROOT[variables.type];
      if (root) {
        void queryClient.invalidateQueries({ queryKey: [...root] });
      }
    },
  });
}
