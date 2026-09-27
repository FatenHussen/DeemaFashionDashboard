import type { IconItem, IconListResponse, IconCreatePayload, IconDetailsResponse } from '../types/icon.types';

import { apiRoutes, putMultipart, axiosInstance, postMultipart } from '@/api';

import { iconUrlFrom, pickIconFileUrl } from '../utils/icon-artwork';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeIconItem(raw: unknown): IconItem | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = Number(row.id);
  if (!Number.isFinite(id) || id <= 0) return null;
  const icon = iconUrlFrom(row.icon);
  const image = iconUrlFrom(row.image);
  // Keep `?v=` when it belongs to the same file. A different `image` path wins over an older `icon`.
  const src = pickIconFileUrl(image, icon);
  return {
    ...(row as unknown as IconItem),
    id,
    icon: src || null,
    image: src,
  };
}

function unwrapIconItems(raw: unknown): IconItem[] {
  const root = asRecord(raw);
  const buckets: unknown[] = [];
  if (Array.isArray(raw)) buckets.push(raw);
  if (root) {
    if (Array.isArray(root.items)) buckets.push(root.items);
    if (Array.isArray(root.data)) buckets.push(root.data);
    const inner = asRecord(root.data);
    if (inner) {
      if (Array.isArray(inner.items)) buckets.push(inner.items);
      if (Array.isArray(inner.data)) buckets.push(inner.data);
    }
  }
  const list = (buckets.find((b) => Array.isArray(b)) as unknown[] | undefined) ?? [];
  return list.map(normalizeIconItem).filter((item): item is IconItem => item != null);
}

function unwrapPagination(raw: unknown, fallbackPerPage: number, itemCount: number) {
  const root = asRecord(raw);
  const inner = asRecord(root?.data) ?? root;
  const pagination = asRecord(inner?.pagination) ?? asRecord(root?.meta) ?? asRecord(inner?.meta);
  const current = Number(pagination?.current_page ?? 1) || 1;
  const perPage = Number(pagination?.per_page ?? fallbackPerPage) || fallbackPerPage;
  const total = Number(pagination?.total ?? itemCount) || itemCount;
  const last = Number(pagination?.last_page ?? Math.max(1, Math.ceil(total / perPage))) || 1;
  return {
    current_page: current,
    last_page: last,
    per_page: perPage,
    total,
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read icon file'));
    reader.readAsDataURL(file);
  });
}

/** File, original filename, and the same bytes as a data URL. Omit all three when there is no new file. */
async function appendIconImage(formData: FormData, file: File) {
  const filename = file.name || 'icon.webp';
  formData.append('image', file, filename);
  formData.append('image_filename', filename);
  // Windows often labels a .webp as application/octet-stream. Send that data URL too.
  const dataUrl = await readFileAsDataUrl(file);
  if (dataUrl.includes(';base64,')) {
    formData.append('image_base64', dataUrl);
  }
}

async function appendIconFields(formData: FormData, data: Partial<IconCreatePayload>) {
  // A stored URL must not be posted as `image`. Text fields alone do not replace the file.
  if (data.image instanceof File) {
    await appendIconImage(formData, data.image);
  }
  if (data.name) {
    formData.append('name[en]', data.name.en ?? '');
    formData.append('name[ar]', data.name.ar ?? '');
  }
  if (data.description?.en) formData.append('description[en]', data.description.en);
  if (data.description?.ar) formData.append('description[ar]', data.description.ar);
  formData.append('full_description[en]', data.full_description?.en ?? '');
  formData.append('full_description[ar]', data.full_description?.ar ?? '');
  if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');
}

/** Raw `data.image` only. Do not fill it from `icon` — null means the upload was not stored. */
function rawSavedImage(body: unknown): string | null {
  const data = asRecord(asRecord(body)?.data);
  if (!data || data.image == null || data.image === '') return null;
  const url = iconUrlFrom(data.image);
  return url || null;
}

function withNormalizedIcon(body: unknown) {
  const root = asRecord(body);
  const item = normalizeIconItem(asRecord(root?.data) ?? root);
  return { ...(root ?? {}), data: item, savedImage: rawSavedImage(body) };
}

export const _IconApi = {
  getListIcons: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    is_active?: number;
  }): Promise<IconListResponse> => {
    const response = await axiosInstance.get(apiRoutes.icon.list, { params });
    const items = unwrapIconItems(response.data);
    return {
      status: true,
      message: '',
      ...asRecord(response.data),
      data: {
        items,
        pagination: unwrapPagination(response.data, params?.per_page ?? 10, items.length),
      },
    } as IconListResponse;
  },

  getIconById: async (id: number | string): Promise<IconDetailsResponse> => {
    const response = await axiosInstance.get(apiRoutes.icon.details(id));
    const item = normalizeIconItem(asRecord(response.data)?.data ?? response.data);
    return { ...(response.data as IconDetailsResponse), data: item as IconItem };
  },

  createIcon: async (data: IconCreatePayload): Promise<any> => {
    const formData = new FormData();
    await appendIconFields(formData, data);
    // Do not set Content-Type — the browser must add the multipart boundary.
    const response = await postMultipart(apiRoutes.icon.create, formData);
    return withNormalizedIcon(response.data);
  },

  updateIcon: async (id: number | string, data: Partial<IconCreatePayload>): Promise<any> => {
    const formData = new FormData();
    await appendIconFields(formData, data);
    // PHP only parses files on POST. `_method=PUT` still hits the update route.
    // Do not set Content-Type — the browser must add the multipart boundary.
    const response = await putMultipart(apiRoutes.icon.update(id), formData);
    return withNormalizedIcon(response.data);
  },

  deleteIcon: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.icon.delete(id));
    return response.data;
  },
};
