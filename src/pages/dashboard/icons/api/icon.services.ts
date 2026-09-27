import type { IconItem, IconListResponse, IconCreatePayload, IconDetailsResponse } from '../types/icon.types';

import i18n from '@/lib/i18n';
import { toast } from 'react-toastify';
import { paths } from '@/routes/paths';
import { CONFIG } from '@/global-config';
import { apiRoutes, axiosInstance } from '@/api';
import { ApiValidationError } from '@/api/errors';
import { getActiveLanguageCode } from '@/lib/language-code';
import { JWT_STORAGE_KEY } from '@/pages/auth/context/jwt/constant';

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

const ICON_MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
};

function iconMime(filename: string, fallbackType: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return ICON_MIME_BY_EXT[ext] || (fallbackType.startsWith('image/') ? fallbackType : fallbackType || 'application/octet-stream');
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read icon file'));
    reader.readAsDataURL(file);
  });
}

function bytesToDataUrl(bytes: ArrayBuffer, mime: string): string {
  const view = new Uint8Array(bytes);
  let binary = '';
  const chunkSize = 8192;
  for (let index = 0; index < view.length; index += chunkSize) {
    binary += String.fromCharCode(...view.subarray(index, index + chunkSize));
  }
  return `data:${mime};base64,${btoa(binary)}`;
}

/**
 * Read the bytes first, then send the file, its original name, and the same bytes as a data URL.
 * A cloned or detached File can make the multipart part empty while the text fields still save.
 */
async function appendIconImage(formData: FormData, file: File) {
  const filename = file.name || 'icon.webp';
  const bytes = await file.arrayBuffer();
  if (!bytes.byteLength) {
    throw new Error('ICON_IMAGE_EMPTY');
  }
  const type = iconMime(filename, file.type);
  const upload = new File([bytes], filename, { type, lastModified: file.lastModified });
  formData.append('image', upload, filename);
  formData.append('image_filename', filename);
  const dataUrl = await readFileAsDataUrl(upload);
  // Windows often labels a .webp as application/octet-stream. Send that data URL too.
  formData.append('image_base64', dataUrl.includes(';base64,') ? dataUrl : bytesToDataUrl(bytes, type));
}

function iconApiUrl(path: string): string {
  const base = String(CONFIG.serverUrl ?? '').replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

function validationMessage(errors: unknown): string | null {
  if (!errors || typeof errors !== 'object') return null;
  const lines: string[] = [];
  for (const value of Object.values(errors as Record<string, unknown>)) {
    const items = Array.isArray(value) ? value : [value];
    for (const item of items) {
      if (typeof item === 'string' && item.trim()) lines.push(item.trim());
    }
  }
  return lines.length ? [...new Set(lines)].join(' · ') : null;
}

function fieldErrorBag(errors: unknown): Record<string, string[]> | null {
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return null;
  const result: Record<string, string[]> = {};
  for (const [field, value] of Object.entries(errors as Record<string, unknown>)) {
    const messages = (Array.isArray(value) ? value : [value]).filter(
      (item): item is string => typeof item === 'string' && item.trim() !== ''
    );
    if (messages.length) result[field] = messages;
  }
  return Object.keys(result).length ? result : null;
}

/** Browser `fetch` sets the multipart boundary. Axios must not set Content-Type on this body. */
async function postIconForm(path: string, formData: FormData): Promise<unknown> {
  const headers = new Headers();
  const token = sessionStorage.getItem(JWT_STORAGE_KEY);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('Accept', 'application/json');
  headers.set('Accept-Language', getActiveLanguageCode());

  let response: Response;
  try {
    response = await fetch(iconApiUrl(path), { method: 'POST', headers, body: formData });
  } catch (error) {
    const message = i18n.t('networkError', { ns: 'common' });
    toast.error(message);
    throw Object.assign(new Error(message), { cause: error });
  }

  const body = await response.json().catch(() => null);
  if (response.ok) return body;

  const record = body && typeof body === 'object' ? (body as { message?: string; errors?: unknown }) : null;
  const message =
    validationMessage(record?.errors) ||
    (typeof record?.message === 'string' && record.message.trim() ? record.message : '') ||
    i18n.t('genericError', { ns: 'common' });

  if (response.status === 401) {
    sessionStorage.removeItem(JWT_STORAGE_KEY);
    sessionStorage.removeItem('user_data');
    if (!window.location.pathname.includes('/auth/')) {
      window.location.replace(paths.auth.jwt.signIn);
    }
    toast.error(message);
    throw new Error(message);
  }

  toast.error(message);
  const fields = response.status === 422 ? fieldErrorBag(record?.errors) : null;
  if (fields) throw new ApiValidationError(message, fields);
  throw new Error(message);
}

async function appendIconFields(formData: FormData, data: Partial<IconCreatePayload>) {
  // A stored URL must not be posted as `image`. Text fields alone do not replace the file.
  if (data.image instanceof File) {
    await appendIconImage(formData, data.image);
    const attached = formData.get('image');
    const base64 = formData.get('image_base64');
    if (
      !(attached instanceof File) ||
      attached.size < 1 ||
      typeof base64 !== 'string' ||
      !base64.includes(';base64,')
    ) {
      throw new Error('ICON_IMAGE_EMPTY');
    }
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
    const body = await postIconForm(apiRoutes.icon.create, formData);
    return withNormalizedIcon(body);
  },

  updateIcon: async (id: number | string, data: Partial<IconCreatePayload>): Promise<any> => {
    const formData = new FormData();
    await appendIconFields(formData, data);
    // PHP only parses files on POST. `_method=PUT` still hits the update route.
    formData.append('_method', 'PUT');
    const body = await postIconForm(apiRoutes.icon.update(id), formData);
    return withNormalizedIcon(body);
  },

  deleteIcon: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.icon.delete(id));
    return response.data;
  },
};
