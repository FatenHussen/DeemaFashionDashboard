import type { AxiosResponse, AxiosRequestConfig } from 'axios';

import axiosInstance from './axios';

/**
 * PHP only populates $_POST / $_FILES for POST. Laravel still honors Route::put / Route::patch
 * when the body includes `_method`. Never send FormData with a real PUT/PATCH.
 *
 * Do not set `Content-Type` here. Axios leaves it unset for FormData so the browser adds the
 * multipart boundary. A manual `multipart/form-data` header, or replacing `transformRequest`,
 * makes PHP save the text and drop the file.
 */
export const postMultipart = <T = unknown>(
  url: string,
  fd: FormData,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> =>
  axiosInstance.post<T>(url, fd, {
    ...config,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

export const putMultipart = <T = unknown>(
  url: string,
  fd: FormData,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  if (!fd.has('_method')) fd.append('_method', 'PUT');
  return postMultipart(url, fd, config);
};

export const patchMultipart = <T = unknown>(
  url: string,
  fd: FormData,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  if (!fd.has('_method')) fd.append('_method', 'PATCH');
  return postMultipart(url, fd, config);
};
