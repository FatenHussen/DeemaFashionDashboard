import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _SettingApi } from '../api/setting.services';

export const useFetchSettings = (page: number = 1, perPage: number = 50) =>
  useQuery({
    queryKey: queryKeys.setting.list({ page, per_page: perPage }),
    queryFn: () => _SettingApi.getListSettings({ page, per_page: perPage }),
  });

export const useFetchSettingByKey = (key: string) =>
  useQuery({
    queryKey: queryKeys.setting.details(key),
    queryFn: () => _SettingApi.getSettingByKey(key),
    enabled: !!key,
  });

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value, isFile }: { key: string; value: any; isFile?: boolean }) =>
      _SettingApi.updateSetting(key, value, isFile),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['setting'] });
      if (variables?.key) {
        queryClient.invalidateQueries({ queryKey: queryKeys.setting.details(variables.key) });
      }
    },
  });
};
