import { axiosInstance, apiRoutes } from '@/api';
import type { ShopData, ShopListResponse, ShopCreateUpdatePayload } from '../types/shop.types';

export const _ShopApi = {
  getListShop: async (): Promise<ShopListResponse> => {
    const response = await axiosInstance.get<ShopListResponse>(apiRoutes.shop.list);
    console.log(response);
    return response.data;
  },
  createShop: async (data: ShopCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.post(apiRoutes.shop.create, data);
    return response.data;
  },
  updateShop: async (id: number | string, data: ShopCreateUpdatePayload): Promise<any> => {
    const response = await axiosInstance.put(apiRoutes.shop.update(id), data);
    return response.data;
  },
  deleteShop: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.shop.delete(id));
    return response.data;
  },
  getShopById: async (id: number | string): Promise<ShopData> => {
    const response = await axiosInstance.get<ShopListResponse>(apiRoutes.shop.list);
    // Find the shop by ID from the list (or you might have a separate endpoint)
    const shop = response.data.data.items.find((item) => item.id === Number(id));
    if (!shop) {
      throw new Error('Shop not found');
    }
    return shop;
  },
};
