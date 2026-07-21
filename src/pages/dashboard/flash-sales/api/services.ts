import type {
  FlashSaleModel,
  FlashSaleListResponse,
  FlashSaleMutationResponse,
} from '../types';

import { apiRoutes, axiosInstance } from '@/api';

import { normalizeFlashSaleRecord, normalizeFlashSaleListItem } from '../normalize';

function normalizeListPayload(body: any): FlashSaleListResponse['data'] {
  const inner = body?.data;
  let itemsRaw: any[] = [];
  let pagination: FlashSaleListResponse['data']['pagination'] = {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  };

  if (inner?.data && Array.isArray(inner.data)) {
    itemsRaw = inner.data;
    pagination = inner.pagination ?? pagination;
  } else if (inner?.items) {
    itemsRaw = inner.items;
    pagination = inner.pagination ?? pagination;
  } else if (Array.isArray(inner)) {
    itemsRaw = inner;
  }

  const items = itemsRaw.map((row) =>
    normalizeFlashSaleListItem(row != null && typeof row === 'object' ? (row as Record<string, unknown>) : {})
  );

  return { items, pagination };
}

export type FlashSaleWritePayload = {
  name: string;
  end_date: string;
  is_active: boolean;
  discount: number;
  discount_type: 'percent' | 'fixed';
  product_ids?: number[];
  category_id?: number | null;
  vendor_id?: number | null;
};

export const _FlashSaleApi = {
  getList: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<FlashSaleListResponse> => {
    const response = await axiosInstance.get<FlashSaleListResponse>(apiRoutes.flashSale.list, {
      params,
    });
    const body = response.data as any;
    return {
      status: body.status,
      message: body.message,
      data: normalizeListPayload(body),
    };
  },

  create: async (payload: FlashSaleWritePayload): Promise<FlashSaleMutationResponse> => {
    const response = await axiosInstance.post(
      apiRoutes.flashSale.create,
      payload
    );
    const body = response.data as {
      status?: boolean;
      message?: string;
      data?: Record<string, unknown>;
    };
    const raw = body?.data;
    return {
      status: Boolean(body.status),
      message: body.message,
      data:
        raw != null && typeof raw === 'object'
          ? normalizeFlashSaleRecord(raw as Record<string, unknown>)
          : ({} as FlashSaleModel),
    };
  },

  update: async (
    id: number | string,
    payload: FlashSaleWritePayload
  ): Promise<FlashSaleMutationResponse> => {
    const response = await axiosInstance.put(
      apiRoutes.flashSale.update(id),
      payload
    );
    const body = response.data as {
      status?: boolean;
      message?: string;
      data?: Record<string, unknown>;
    };
    const raw = body?.data;
    return {
      status: Boolean(body.status),
      message: body.message,
      data:
        raw != null && typeof raw === 'object'
          ? normalizeFlashSaleRecord(raw as Record<string, unknown>)
          : ({} as FlashSaleModel),
    };
  },
};
