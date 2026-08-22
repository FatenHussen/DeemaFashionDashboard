import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: CONFIG.serverUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data as
      | { message?: string; errors?: Record<string, string[] | string> }
      | undefined;
    let message = (typeof data?.message === 'string' && data.message.trim() ? data.message : null) ||
      error?.message ||
      'Something went wrong!';
    // Laravel validation: surface the first field error (message alone is often generic).
    const errors = data?.errors;
    if (errors && typeof errors === 'object') {
      for (const val of Object.values(errors)) {
        const first = Array.isArray(val) ? val[0] : val;
        if (typeof first === 'string' && first.trim()) {
          message = first;
          break;
        }
      }
    }
    console.error('Axios error:', message);
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async <T = unknown>(
  args: string | [string, AxiosRequestConfig]
): Promise<T> => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args, {}];

    const res = await axiosInstance.get<T>(url, config);

    return res.data;
  } catch (error) {
    console.error('Fetcher failed:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/admin/auth/me',
    signIn: '/admin/auth/login',
    logout: '/admin/auth/logout',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
} as const;
