import type { PagePreviewQueryParams } from '../types/page-preview.types';

// ----------------------------------------------------------------------

export function serializePagePreviewParams(params?: PagePreviewQueryParams): string {
  if (!params || Object.keys(params).length === 0) return '';

  return Object.entries(params)
    .filter(([, value]) => value != null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
}

export function parsePagePreviewParams(searchParams: URLSearchParams): PagePreviewQueryParams {
  const params: PagePreviewQueryParams = {};

  searchParams.forEach((value, key) => {
    const decoded = decodeURIComponent(value);
    const asNumber = Number(decoded);
    params[key] = Number.isFinite(asNumber) && String(asNumber) === decoded ? asNumber : decoded;
  });

  return params;
}

export function toPagePreviewRequestParams(
  params: PagePreviewQueryParams
): PagePreviewQueryParams | undefined {
  const cleaned: PagePreviewQueryParams = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') {
      cleaned[key] = value;
    }
  });

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

export function buildPagePreviewFilters(
  prev: PagePreviewQueryParams,
  key: string,
  value: string | number | undefined
): PagePreviewQueryParams {
  const next = { ...prev };

  if (value == null || value === '') {
    delete next[key];
  } else {
    next[key] = value;
  }

  return next;
}

export function filtersToSearchParams(filters: PagePreviewQueryParams): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value != null && value !== '') {
      params.set(key, String(value));
    }
  });

  return params;
}
