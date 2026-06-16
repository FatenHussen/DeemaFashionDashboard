/**
 * Popup campaign admin API client.
 *
 * Create/update use multipart/form-data: localized fields use bracket notation (`title[en]`, …),
 * arrays use `[]` suffix, and media must be sent as an uploaded file under `media_path`.
 */
import type {
  PopupCampaignDetail,
  PopupCampaignListResponse,
  PopupCampaignDetailResponse,
  PopupCampaignUpsertPayload,
  LocalizedString,
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

function appendLocalized(fd: FormData, key: string, loc: LocalizedString) {
  fd.append(`${key}[en]`, loc.en ?? '');
  fd.append(`${key}[ar]`, loc.ar ?? '');
}

function appendOptionalLocalized(fd: FormData, key: string, loc: LocalizedString | null | undefined) {
  const en = loc?.en ?? '';
  const ar = loc?.ar ?? '';
  fd.append(`${key}[en]`, en);
  fd.append(`${key}[ar]`, ar);
}

function buildPopupCampaignFormData(
  fields: PopupCampaignUpsertPayload,
  mediaFile?: File | null
): FormData {
  const fd = new FormData();

  appendLocalized(fd, 'title', fields.title);
  fd.append('slug', fields.slug);
  fd.append('type', fields.type);
  fd.append('status', fields.status);
  fd.append('priority', String(fields.priority));

  appendLocalized(fd, 'headline', fields.headline);
  appendOptionalLocalized(fd, 'subheadline', fields.subheadline ?? null);
  appendOptionalLocalized(fd, 'description', fields.description ?? null);

  fd.append('button_text', fields.button_text);
  if (fields.button_url != null && String(fields.button_url).trim() !== '') {
    fd.append('button_url', String(fields.button_url).trim());
  }
  if (fields.secondary_button_text != null && String(fields.secondary_button_text).trim() !== '') {
    fd.append('secondary_button_text', String(fields.secondary_button_text).trim());
  }

  fd.append('media_type', fields.media_type);
  if (mediaFile instanceof File) {
    fd.append('media_path', mediaFile);
  }

  (fields.show_on_pages ?? []).forEach((p) => fd.append('show_on_pages[]', p));

  fd.append('audience_type', fields.audience_type);
  fd.append('trigger_type', fields.trigger_type);
  if (fields.trigger_value != null && Number.isFinite(Number(fields.trigger_value))) {
    fd.append('trigger_value', String(fields.trigger_value));
  }

  fd.append('form_enabled', fields.form_enabled ? '1' : '0');
  (fields.form_fields ?? []).forEach((f) => fd.append('form_fields[]', f));

  (fields.product_ids ?? []).forEach((id) => fd.append('product_ids[]', String(id)));
  (fields.shop_ids ?? []).forEach((id) => fd.append('shop_ids[]', String(id)));
  (fields.recipe_ids ?? []).forEach((id) => fd.append('recipe_ids[]', String(id)));
  (fields.promotion_ids ?? []).forEach((id) => fd.append('promotion_ids[]', String(id)));
  (fields.basket_ids ?? []).forEach((id) => fd.append('basket_ids[]', String(id)));
  (fields.shop_vendor_service_ids ?? []).forEach((id) =>
    fd.append('shop_vendor_service_ids[]', String(id))
  );

  return fd;
}

function throwIfEnvelopeFailed(body: { status?: boolean; message?: string } | null | undefined) {
  if (body && body.status === false) {
    throw new Error(
      typeof body.message === 'string' && body.message.trim() ? body.message : 'Request failed'
    );
  }
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

  create: async (
    fields: PopupCampaignUpsertPayload,
    mediaFile: File
  ): Promise<PopupCampaignDetailResponse> => {
    const fd = buildPopupCampaignFormData(fields, mediaFile);
    const response = await axiosInstance.post<PopupCampaignDetailResponse>(
      apiRoutes.popupCampaign.create,
      fd,
      {
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );
    const body = response.data as PopupCampaignDetailResponse & {
      status?: boolean;
      message?: string;
    };
    throwIfEnvelopeFailed(body);
    return response.data;
  },

  update: async (
    id: number | string,
    fields: PopupCampaignUpsertPayload,
    mediaFile?: File | null
  ): Promise<PopupCampaignDetailResponse> => {
    const fd = buildPopupCampaignFormData(fields, mediaFile);
    // PHP often does not populate multipart bodies on PUT; spoof POST like other admin resources.
    fd.append('_method', 'PUT');
    const response = await axiosInstance.post<PopupCampaignDetailResponse>(
      apiRoutes.popupCampaign.update(id),
      fd,
      {
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );
    const body = response.data as PopupCampaignDetailResponse & {
      status?: boolean;
      message?: string;
    };
    throwIfEnvelopeFailed(body);
    return response.data;
  },

  delete: async (id: number | string): Promise<{ status: boolean; data: boolean }> => {
    const response = await axiosInstance.delete(apiRoutes.popupCampaign.delete(id));
    return response.data;
  },
};
