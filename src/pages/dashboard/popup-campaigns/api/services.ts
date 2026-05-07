/**
 * Popup campaign admin API client.
 *
 * Create/update use JSON body with localized objects (`title.ar/en`, `headline.ar/en`, ...).
 * Primary CTA destination is `button_url`, and media is provided by `media_path` string.
 */
import type {
  PopupCampaignDetail,
  PopupCampaignListResponse,
  PopupCampaignDetailResponse,
  PopupCampaignUpsertPayload,
} from '../types';

import { apiRoutes, axiosInstance } from '@/api';

/**
 * Resolves the campaign object whether the HTTP body is `{ data: { id, ... } }`, double-wrapped
 * `data.data`, or a bare resource (no envelope).
 */
/** Laravel JsonResource can nest fields under `attributes` next to `id`. */
function mergeResourceAttributesIfNeeded(
  node: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  if (!node || typeof node !== 'object') return {};
  if (
    'attributes' in node &&
    node.attributes != null &&
    typeof node.attributes === 'object' &&
    !Array.isArray(node.attributes) &&
    !('title' in node) &&
    !('headline' in node)
  ) {
    return { ...node, ...((node as { attributes: Record<string, unknown> }).attributes) };
  }
  return { ...node };
}

function normalizeDetailPayload(body: unknown): PopupCampaignDetail | null {
  const root = body as Record<string, unknown> | null | undefined;
  if (!root || typeof root !== 'object') return null;

  const first = root.data;
  if (first != null && typeof first === 'object' && !Array.isArray(first)) {
    if ('id' in first) {
      return mergeResourceAttributesIfNeeded(
        first as Record<string, unknown>
      ) as unknown as PopupCampaignDetail;
    }
    const second = (first as Record<string, unknown>).data;
    if (second != null && typeof second === 'object' && !Array.isArray(second) && 'id' in second) {
      return mergeResourceAttributesIfNeeded(
        second as Record<string, unknown>
      ) as unknown as PopupCampaignDetail;
    }
  }
  if ('id' in root && (typeof root.id === 'number' || typeof root.id === 'string')) {
    return mergeResourceAttributesIfNeeded(root) as unknown as PopupCampaignDetail;
  }
  return null;
}

function normalizeListPayload(body: any): PopupCampaignListResponse['data'] {
  const inner = body?.data;
  let items: PopupCampaignListResponse['data']['items'] = [];
  let pagination: PopupCampaignListResponse['data']['pagination'] = {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  };

  if (inner?.data && Array.isArray(inner.data)) {
    items = inner.data;
    pagination = inner.pagination ?? pagination;
  } else if (inner?.items) {
    items = inner.items;
    pagination = inner.pagination ?? pagination;
  } else if (Array.isArray(inner)) {
    items = inner;
  }

  return { items, pagination };
}

export const _PopupCampaignApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    sort_field?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<PopupCampaignListResponse> => {
    const response = await axiosInstance.get<PopupCampaignListResponse>(
      apiRoutes.popupCampaign.list,
      { params }
    );
    const body = response.data as any;
    return {
      status: body.status,
      message: body.message,
      data: normalizeListPayload(body),
    };
  },

  getById: async (id: number | string): Promise<PopupCampaignDetailResponse> => {
    const response = await axiosInstance.get<PopupCampaignDetailResponse>(
      apiRoutes.popupCampaign.details(id)
    );
    const body = response.data as PopupCampaignDetailResponse & Record<string, unknown>;
    const campaign = normalizeDetailPayload(body);
    return {
      status: body.status,
      message: typeof body.message === 'string' ? body.message : '',
      data: (campaign ?? body.data) as PopupCampaignDetail,
    };
  },

  create: async (payload: PopupCampaignUpsertPayload): Promise<PopupCampaignDetailResponse> => {
    const response = await axiosInstance.post<PopupCampaignDetailResponse>(
      apiRoutes.popupCampaign.create,
      payload
    );
    const body = response.data as PopupCampaignDetailResponse & { status?: boolean; message?: string };
    if (body && body.status === false) {
      throw new Error(typeof body.message === 'string' && body.message.trim() ? body.message : 'Request failed');
    }
    return response.data;
  },

  update: async (
    id: number | string,
    payload: PopupCampaignUpsertPayload
  ): Promise<PopupCampaignDetailResponse> => {
    const response = await axiosInstance.put<PopupCampaignDetailResponse>(
      apiRoutes.popupCampaign.update(id),
      payload
    );
    const body = response.data as PopupCampaignDetailResponse & { status?: boolean; message?: string };
    if (body && body.status === false) {
      throw new Error(typeof body.message === 'string' && body.message.trim() ? body.message : 'Request failed');
    }
    return response.data;
  },

  delete: async (id: number | string): Promise<{ status: boolean; data: boolean }> => {
    const response = await axiosInstance.delete(apiRoutes.popupCampaign.delete(id));
    return response.data;
  },
};
