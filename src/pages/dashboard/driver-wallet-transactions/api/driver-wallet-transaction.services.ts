import type {
  DriverWalletTransactionItem,
  DriverWalletTransactionListParams,
  DriverWalletTransactionListResponse,
  DriverWalletTransactionDetailsResponse,
} from '../types/driver-wallet-transaction.types';

import { apiRoutes, axiosInstance } from '@/api';

import { pickDriverImageRaw } from '../utils/driver-display';

function mapDriver(driver: unknown): DriverWalletTransactionItem['driver'] {
  const d = (driver && typeof driver === 'object' ? driver : {}) as Record<string, unknown>;
  const imageRaw = pickDriverImageRaw(d);
  return {
    id: Number(d.id),
    name: String(d.name ?? ''),
    email: String(d.email ?? ''),
    phone: String(d.phone ?? ''),
    ...(imageRaw ? { image_url: imageRaw } : {}),
  };
}

function mapItem(item: DriverWalletTransactionItem): DriverWalletTransactionItem {
  if (!item?.driver) return item;
  return {
    ...item,
    driver: mapDriver(item.driver),
  };
}

export const _DriverWalletTransactionApi = {
  getList: async (
    params?: DriverWalletTransactionListParams
  ): Promise<DriverWalletTransactionListResponse> => {
    const response = await axiosInstance.get<DriverWalletTransactionListResponse>(
      apiRoutes.driverWalletTransaction.list,
      { params }
    );
    const body = response.data;
    if (!body?.data?.items) return body;
    return {
      ...body,
      data: {
        ...body.data,
        items: body.data.items.map(mapItem),
      },
    };
  },

  getById: async (id: number | string): Promise<DriverWalletTransactionDetailsResponse> => {
    const response = await axiosInstance.get<DriverWalletTransactionDetailsResponse>(
      apiRoutes.driverWalletTransaction.details(id)
    );
    const body = response.data;
    if (!body?.data) return body;
    return {
      ...body,
      data: mapItem(body.data),
    };
  },
};
