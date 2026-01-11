import type {
  CategoryListResponse,
  CategoryDetailResponse,
  CategoryCreateUpdatePayload,
} from '../types/category.types';

import { apiRoutes, axiosInstance } from '@/api';

export type { CategoryCreateUpdatePayload };

export const _CategoryApi = {
  getListCategories: async (parentId?: number): Promise<CategoryListResponse> => {
    const url = parentId
      ? `${apiRoutes.category.list}?parent_id=${parentId}`
      : apiRoutes.category.list;
    const response = await axiosInstance.get<CategoryListResponse>(url);
    return response.data;
  },
  getCategoryById: async (id: number | string): Promise<CategoryDetailResponse> => {
    const response = await axiosInstance.get<CategoryDetailResponse>(
      apiRoutes.category.details(id)
    );
    return response.data;
  },
  createCategory: async (data: CategoryCreateUpdatePayload): Promise<any> => {
    const formData = new FormData();
    
    formData.append('name[en]', data.name.en);
    formData.append('name[ar]', data.name.ar);
    formData.append('description[en]', data.description.en);
    formData.append('description[ar]', data.description.ar);
    
    if (data.icon) {
      formData.append('icon', data.icon);
    }
    
    if (data.parent_id) {
      formData.append('parent_id', data.parent_id.toString());
    }
    
    const response = await axiosInstance.post(apiRoutes.category.create, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  updateCategory: async (
    id: number | string,
    data: CategoryCreateUpdatePayload
  ): Promise<any> => {
    const formData = new FormData();
    
    formData.append('name[en]', data.name.en);
    formData.append('name[ar]', data.name.ar);
    formData.append('description[en]', data.description.en);
    formData.append('description[ar]', data.description.ar);
    
    if (data.icon) {
      formData.append('icon', data.icon);
    }
    
    if (data.parent_id) {
      formData.append('parent_id', data.parent_id.toString());
    } else {
      formData.append('parent_id', '');
    }
    
    const response = await axiosInstance.put(apiRoutes.category.update(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  deleteCategory: async (id: number | string): Promise<any> => {
    const response = await axiosInstance.delete(apiRoutes.category.delete(id));
    return response.data;
  },
};

