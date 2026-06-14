import type { BadgeItem, BadgeListResponse, BadgeCreatePayload, BadgeDetailsResponse } from '../types/badge.types';

import { apiRoutes, axiosInstance } from '@/api';
import { parseRecordIsActive } from '@/utils/parse-record-is-active';

function normalizeBadgeListItem(raw: BadgeItem): BadgeItem {
  const row = raw as unknown as Record<string, unknown>;
  return {
    ...raw,
    is_active: parseRecordIsActive(row),
  };
}

function buildBadgeFormData(data: BadgeCreatePayload): FormData {
  const fd = new FormData();
  if (data.name?.en) fd.append('name[en]', data.name.en);
  if (data.name?.ar) fd.append('name[ar]', data.name.ar);
  if (data.color) fd.append('color', data.color);
  fd.append('position', data.position);
  if (data.image instanceof File) fd.append('image', data.image);
  return fd;
}

export const _BadgeApi = {
  getListBadges: async (params?: { page?: number; per_page?: number; type?: string; search?: string }): Promise<BadgeListResponse> => {
    const response = await axiosInstance.get<BadgeListResponse>(apiRoutes.badge.list, { params });
    const body = response.data;
    if (!body?.data?.items) return body;
    return {
      ...body,
      data: {
        ...body.data,
        items: body.data.items.map((item) => normalizeBadgeListItem(item)),
      },
    };
  },

  getBadgeById: async (id: number | string): Promise<BadgeDetailsResponse> => {
    const response = await axiosInstance.get(apiRoutes.badge.details(id));
    return response.data;
  },

  createBadge: async (data: BadgeCreatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.badge.create, buildBadgeFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateBadge: async (id: number | string, data: Partial<BadgeCreatePayload>): Promise<any> => {
    const fd = buildBadgeFormData(data as BadgeCreatePayload);
    fd.append('_method', 'PATCH');
    const response = await axiosInstance.post(apiRoutes.badge.update(id), fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteBadge: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.badge.delete(id));
    return response.data;
  },
};
