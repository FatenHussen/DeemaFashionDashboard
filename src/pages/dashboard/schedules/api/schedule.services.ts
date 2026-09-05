import type {
  ScheduleItem,
  ScheduleListParams,
  ScheduleListResponse,
  ScheduleCreatePayload,
  ScheduleUpdatePayload,
  ScheduleDetailsResponse,
} from '../types/schedule.types';

import { apiRoutes, axiosInstance } from '@/api';
import { parseRecordIsActive } from '@/utils/parse-record-is-active';

// ----------------------------------------------------------------------

const defaultPagination = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
} as const;

function normalizeScheduleItem(raw: unknown): ScheduleItem {
  const row = (raw ?? {}) as Record<string, unknown>;
  return {
    ...(row as unknown as ScheduleItem),
    is_active: parseRecordIsActive(row, Boolean(row.is_active)),
  };
}

function normalizeListData(raw: unknown): ScheduleListResponse['data'] {
  const root = raw as Record<string, unknown> | null | undefined;
  if (!root || typeof root !== 'object') {
    return { items: [], pagination: { ...defaultPagination } };
  }
  const nested =
    root.data != null && typeof root.data === 'object' && !Array.isArray(root.data) && 'items' in (root.data as object)
      ? (root.data as Record<string, unknown>)
      : root;
  const items = Array.isArray(nested.items) ? nested.items.map((item) => normalizeScheduleItem(item)) : [];
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
    return normalizeScheduleItem(root.data);
  }
  if ('id' in root) {
    return normalizeScheduleItem(root);
  }
  throw new Error(typeof root.message === 'string' ? root.message : 'Invalid schedule response');
}

/** Laravel list filter expects `is_active=1` / `is_active=0`. */
function toListQuery(params?: ScheduleListParams): Record<string, unknown> | undefined {
  if (!params) return undefined;
  const { is_active, ...rest } = params;
  const query: Record<string, unknown> = { ...rest };
  if (is_active === true) query.is_active = 1;
  if (is_active === false) query.is_active = 0;
  return query;
}

function buildScheduleFormData(data: ScheduleCreatePayload | ScheduleUpdatePayload): FormData {
  const fd = new FormData();
  fd.append('name[ar]', data.name.ar);
  fd.append('name[en]', data.name.en);

  fd.append('description[en]', (data.description?.en ?? '').trim());
  fd.append('description[ar]', (data.description?.ar ?? '').trim());

  fd.append('interval_days', String(data.interval_days));
  fd.append('is_active', data.is_active ? '1' : '0');

  if (data.discount_type) {
    fd.append('discount_type', data.discount_type);
    fd.append('discount_value', String(data.discount_value ?? 0));
  }

  if (data.image instanceof File) fd.append('image', data.image);

  if (data.images?.length) {
    data.images.forEach((file) => {
      if (file instanceof File) fd.append('images[]', file);
    });
  }

  (data.deleted_image_ids ?? []).forEach((id) => {
    fd.append('deleted_image_ids[]', String(id));
  });

  (data.badges ?? []).forEach((badge, i) => {
    fd.append(`badges[${i}][id]`, String(badge.id));
    fd.append(`badges[${i}][position]`, badge.position);
  });

  return fd;
}

export const _ScheduleApi = {
  getList: async (params?: ScheduleListParams): Promise<ScheduleListResponse> => {
    const response = await axiosInstance.get(apiRoutes.schedule.list, { params: toListQuery(params) });
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
    const response = await axiosInstance.post(apiRoutes.schedule.create, buildScheduleFormData(data));
    return response.data;
  },

  update: async (id: number | string, data: ScheduleUpdatePayload): Promise<unknown> => {
    const formData = buildScheduleFormData(data);
    // Multipart PUT is not parsed by PHP; spoof PUT via POST.
    formData.append('_method', 'PUT');
    const response = await axiosInstance.post(apiRoutes.schedule.update(id), formData);
    return response.data;
  },

  delete: async (id: number | string): Promise<unknown> => {
    const response = await axiosInstance.delete(apiRoutes.schedule.delete(id));
    return response.data;
  },
};
