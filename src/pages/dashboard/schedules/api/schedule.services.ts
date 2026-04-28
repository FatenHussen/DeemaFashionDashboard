import type {
  ScheduleItem,
  ScheduleListParams,
  ScheduleListResponse,
  ScheduleCreatePayload,
  ScheduleUpdatePayload,
  ScheduleDetailsResponse,
} from '../types/schedule.types';

import { apiRoutes, axiosInstance } from '@/api';

// ----------------------------------------------------------------------

const defaultPagination = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
} as const;

function normalizeListData(raw: unknown): ScheduleListResponse['data'] {
  const root = raw as Record<string, unknown> | null | undefined;
  if (!root || typeof root !== 'object') {
    return { items: [], pagination: { ...defaultPagination } };
  }
  const nested =
    root.data != null && typeof root.data === 'object' && !Array.isArray(root.data) && 'items' in (root.data as object)
      ? (root.data as Record<string, unknown>)
      : root;
  const items = Array.isArray(nested.items) ? (nested.items as ScheduleItem[]) : [];
  const p = nested.pagination as ScheduleListResponse['data']['pagination'] | undefined;
  return {
    items,
    pagination: p ?? { ...defaultPagination },
  };
}

function normalizeDetailData(raw: unknown): ScheduleItem {
  const root = raw as Record<string, unknown> | null | undefined;
  if (!root || typeof root !== 'object') {
    throw new Error('Invalid schedule response');
  }
  if (root.data != null && typeof root.data === 'object' && !Array.isArray(root.data) && 'id' in (root.data as object)) {
    return root.data as ScheduleItem;
  }
  if ('id' in root) {
    return root as unknown as ScheduleItem;
  }
  throw new Error(typeof root.message === 'string' ? root.message : 'Invalid schedule response');
}

export const _ScheduleApi = {
  getList: async (params?: ScheduleListParams): Promise<ScheduleListResponse> => {
    const response = await axiosInstance.get(apiRoutes.schedule.list, { params });
    const body = response.data as Record<string, unknown> | undefined;
    return {
      success: body?.success as boolean | undefined,
      status: (body?.status as boolean | undefined) ?? (body?.success as boolean | undefined),
      message: body?.message as string | undefined,
      data: normalizeListData(body),
    };
  },

  getById: async (id: number | string): Promise<ScheduleDetailsResponse> => {
    const response = await axiosInstance.get(apiRoutes.schedule.details(id));
    const body = response.data as Record<string, unknown> | undefined;
    return {
      success: body?.success as boolean | undefined,
      status: (body?.status as boolean | undefined) ?? (body?.success as boolean | undefined),
      message: (body?.message as string) ?? '',
      data: normalizeDetailData(body),
    };
  },

  create: async (data: ScheduleCreatePayload): Promise<unknown> => {
    const response = await axiosInstance.post(apiRoutes.schedule.create, data);
    return response.data;
  },

  update: async (id: number | string, data: ScheduleUpdatePayload): Promise<unknown> => {
    const response = await axiosInstance.put(apiRoutes.schedule.update(id), data);
    return response.data;
  },

  delete: async (id: number | string): Promise<unknown> => {
    const response = await axiosInstance.delete(apiRoutes.schedule.delete(id));
    return response.data;
  },
};
