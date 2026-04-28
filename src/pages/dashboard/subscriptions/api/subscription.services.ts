import type {
  SubscriptionDetail,
  SubscriptionListParams,
  SubscriptionListResponse,
  SubscriptionDetailsResponse,
} from '../types/subscription.types';

import { apiRoutes, axiosInstance } from '@/api';

// ----------------------------------------------------------------------

const defaultPagination = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
} as const;

/**
 * Supports:
 * - `{ success, data: { items, pagination } }` (documented admin API)
 * - `{ items, pagination }` at root
 */
function normalizeSubscriptionListBody(raw: unknown): SubscriptionListResponse['data'] {
  const root = raw as Record<string, unknown> | null | undefined;
  if (!root || typeof root !== 'object') {
    return { items: [], pagination: { ...defaultPagination } };
  }
  const nested =
    root.data != null &&
    typeof root.data === 'object' &&
    !Array.isArray(root.data) &&
    'items' in (root.data as object)
      ? (root.data as Record<string, unknown>)
      : root;
  const items = Array.isArray(nested.items) ? nested.items : [];
  const p = nested.pagination as SubscriptionListResponse['data']['pagination'] | undefined;
  return {
    items,
    pagination: p ?? { ...defaultPagination },
  };
}

/**
 * Supports `{ success, data: subscription }` or a bare subscription object.
 */
function normalizeSubscriptionDetailBody(raw: unknown): SubscriptionDetail {
  const root = raw as Record<string, unknown> | null | undefined;
  if (!root || typeof root !== 'object') {
    throw new Error('Invalid subscription details response');
  }
  if (root.data != null && typeof root.data === 'object' && !Array.isArray(root.data)) {
    return root.data as SubscriptionDetail;
  }
  if ('id' in root && (typeof root.id === 'number' || typeof root.id === 'string')) {
    return root as unknown as SubscriptionDetail;
  }
  throw new Error(
    typeof root.message === 'string' ? root.message : 'Invalid subscription details response'
  );
}

export const _SubscriptionApi = {
  getListSubscriptions: async (
    params?: SubscriptionListParams
  ): Promise<SubscriptionListResponse> => {
    const response = await axiosInstance.get(apiRoutes.subscription.list, { params });
    const body = response.data as Record<string, unknown> | undefined;
    return {
      success: body?.success as boolean | undefined,
      status: body?.status as boolean | undefined,
      message: body?.message as string | undefined,
      data: normalizeSubscriptionListBody(body),
    };
  },

  getSubscriptionById: async (id: number | string): Promise<SubscriptionDetailsResponse> => {
    const response = await axiosInstance.get(apiRoutes.subscription.details(id));
    const body = response.data as Record<string, unknown> | undefined;
    return {
      success: body?.success as boolean | undefined,
      status: body?.status as boolean | undefined,
      message: body?.message as string | undefined,
      data: normalizeSubscriptionDetailBody(body),
    };
  },
};
