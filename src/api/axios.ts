import axios from 'axios';
import { toast } from 'react-toastify';

import { paths } from 'src/routes/paths';

import i18n from 'src/lib/i18n';
import { CONFIG } from 'src/global-config';
import { getActiveLanguageCode } from 'src/lib/language-code';
import { JWT_STORAGE_KEY } from 'src/pages/auth/context/jwt/constant';

import { ConfirmationRequiredError } from './errors';

// ----------------------------------------------------------------------

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * Suppress the global error toast for this request. Use when the caller renders the
     * failure itself (inline message, fallback UI) so the user isn't told twice.
     */
    skipErrorToast?: boolean;
  }
}

// ----------------------------------------------------------------------

const LOGIN_PATH = paths.auth.jwt.signIn;

/** Fail fast instead of hanging when the API host is unreachable. */
const REQUEST_TIMEOUT = 30_000;

const axiosInstance = axios.create({
  baseURL: CONFIG.serverUrl,
  timeout: REQUEST_TIMEOUT,
});

// If a token already exists (e.g., after refresh), set it on defaults
const bootstrapToken = sessionStorage.getItem(JWT_STORAGE_KEY);
if (bootstrapToken) {
  axiosInstance.defaults.headers.common.Authorization = `Bearer ${bootstrapToken}`;
}

// Attach Authorization and Accept-Language headers
// Attach Authorization and Accept-Language headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem(JWT_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['Accept-Language'] = getActiveLanguageCode();

    return config;
  },
  (error) => Promise.reject(error)
);

// Clear session and redirect to login on 401
const clearSessionAndRedirectToLogin = () => {
  sessionStorage.removeItem(JWT_STORAGE_KEY);
  sessionStorage.removeItem('user_data');
  const currentPath = window.location.pathname;
  const isAlreadyOnAuth = currentPath.includes('/auth/');
  if (!isAlreadyOnAuth) {
    window.location.replace(LOGIN_PATH);
  }
};

/** Laravel-style `{ errors: { field: ["msg"] } }` → one line for toasts. */
function formatApiValidationErrors(errors: unknown): string | null {
  if (!errors || typeof errors !== 'object') return null;
  const lines: string[] = [];
  for (const value of Object.values(errors as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string' && item.trim()) lines.push(item.trim());
      }
    } else if (typeof value === 'string' && value.trim()) {
      lines.push(value.trim());
    }
  }
  if (!lines.length) return null;
  return [...new Set(lines)].join(' · ');
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Request was aborted on purpose (component unmount, react-query cancel):
    // not a failure, so no toast.
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // No response at all -> the request never completed a round trip: host down,
    // DNS/TLS failure, blocked CORS preflight, or timeout. Axios reports these as
    // the raw, untranslated string "Network Error", which means nothing to a user.
    if (!error?.response) {
      const isTimeout = error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT';
      const message = i18n.t(isTimeout ? 'timeoutError' : 'networkError', { ns: 'common' });
      toast.error(message);
      return Promise.reject(Object.assign(new Error(message), { cause: error }));
    }

    const status = error?.response?.status;
    const data = error?.response?.data;
    const validationMessage = formatApiValidationErrors(data?.errors);
    const baseMessage =
      data?.message ||
      error?.message ||
      i18n.t('genericError', { ns: 'common' });

    const message = validationMessage || baseMessage;

    // 401 Unauthorized: token expired or invalid -> redirect to login
    if (status === 401) {
      clearSessionAndRedirectToLogin();
      toast.error(message);
      return Promise.reject(new Error(message));
    }

    const skipToast = Boolean(error?.config?.skipErrorToast);
    if (!skipToast) {
      toast.error(message);
    }

    // 409 + `requires_confirmation`: nothing failed and nothing changed — the backend is asking
    // the user to acknowledge the listed impact and repeat the call with `confirm=true`. Carry
    // the impact through so a caller opted into the flow (`skipErrorToast`) can render it.
    if (status === 409 && data?.requires_confirmation) {
      return Promise.reject(new ConfirmationRequiredError(message, data?.data ?? null));
    }

    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async <T = unknown>(
  args: string | [string, import('axios').AxiosRequestConfig]
): Promise<T> => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args, {}];

    const res = await axiosInstance.get<T>(url, config);

    return res.data;
  } catch (error) {
    console.error(i18n.t('fetcherFailed', { ns: 'common' }), error);
    throw error;
  }
};
