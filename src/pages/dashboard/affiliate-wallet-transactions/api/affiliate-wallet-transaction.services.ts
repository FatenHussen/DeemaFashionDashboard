import type {
  AffiliateWalletTransactionItem,
  AffiliateWalletTransactionListParams,
  AffiliateWalletTransactionListResponse,
  AffiliateWalletTransactionDetailsResponse,
} from '../types/affiliate-wallet-transaction.types';

import { apiRoutes, axiosInstance } from '@/api';

import { normalizeAffiliateId, pickAffiliateImageRaw } from '../utils/affiliate-display';

function mapAffiliate(affiliate: unknown): AffiliateWalletTransactionItem['affiliate'] {
  const a = (affiliate && typeof affiliate === 'object' ? affiliate : {}) as Record<string, unknown>;
  const imageRaw = pickAffiliateImageRaw(a);
  return {
    id: Number(a.id),
    name: String(a.name ?? ''),
    email: String(a.email ?? ''),
    phone: String(a.phone ?? ''),
    ...(imageRaw ? { image_url: imageRaw } : {}),
  };
}

function mapItem(item: AffiliateWalletTransactionItem): AffiliateWalletTransactionItem {
  const affiliateId = normalizeAffiliateId(
    (item as unknown as Record<string, unknown>).affiliate_id
  );
  if (!item?.affiliate) {
    return { ...item, affiliate_id: affiliateId };
  }
  return {
    ...item,
    affiliate_id: affiliateId,
    affiliate: mapAffiliate(item.affiliate),
  };
}

export const _AffiliateWalletTransactionApi = {
  getList: async (
    params?: AffiliateWalletTransactionListParams
  ): Promise<AffiliateWalletTransactionListResponse> => {
    const response = await axiosInstance.get<AffiliateWalletTransactionListResponse>(
      apiRoutes.affiliateWalletTransaction.list,
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

  getById: async (id: number | string): Promise<AffiliateWalletTransactionDetailsResponse> => {
    const response = await axiosInstance.get<AffiliateWalletTransactionDetailsResponse>(
      apiRoutes.affiliateWalletTransaction.details(id)
    );
    const body = response.data;
    if (!body?.data) return body;
    return {
      ...body,
      data: mapItem(body.data),
    };
  },
};
