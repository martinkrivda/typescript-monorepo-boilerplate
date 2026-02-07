import { config } from '@/config';
import {
  buildApiUrl,
  createAuthHeaders,
  handleUnauthorized,
  parseApiResponse,
  toApiError,
  unwrapApiResponse,
} from '@/lib/api/fetch-utils';
import { useAuthForRequest } from './useAuth';

const log = config.REQUEST_LOGGING
  ? (message: string, ...args: unknown[]) => {
      console.info(`[API] ${message}`, ...args);
    }
  : () => {};

export const useApi = () => {
  const { token, logout } = useAuthForRequest();

  const handleResponse = async <T>(response: Response): Promise<T> => {
    handleUnauthorized(response, logout);

    if (response.status === 204) {
      return undefined as T;
    }

    const data = await parseApiResponse<T>(response);

    if (!response.ok) {
      throw toApiError(response, data);
    }

    return unwrapApiResponse<T>(data);
  };

  const get = async <T>(
    endpoint: string,
    options?: { skipAuth?: boolean }
  ): Promise<T> => {
    const url = buildApiUrl(endpoint);
    log(`GET ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeaders(token, options?.skipAuth),
      },
    });

    const result = await handleResponse<T>(response);
    log(`GET ${url} success`, result);
    return result;
  };

  const post = async <T>(
    endpoint: string,
    data?: unknown,
    options?: { skipAuth?: boolean }
  ): Promise<T> => {
    const url = buildApiUrl(endpoint);
    log(`POST ${url}`, data);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeaders(token, options?.skipAuth),
      },
      body: JSON.stringify(data),
    });

    const result = await handleResponse<T>(response);
    log(`POST ${url} success`, result);
    return result;
  };

  const put = async <T>(
    endpoint: string,
    data?: unknown,
    options?: { skipAuth?: boolean }
  ): Promise<T> => {
    const url = buildApiUrl(endpoint);
    log(`PUT ${url}`, data);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeaders(token, options?.skipAuth),
      },
      body: JSON.stringify(data),
    });

    const result = await handleResponse<T>(response);
    log(`PUT ${url} success`, result);
    return result;
  };

  const del = async <T>(
    endpoint: string,
    options?: { skipAuth?: boolean }
  ): Promise<T> => {
    const url = buildApiUrl(endpoint);
    log(`DELETE ${url}`);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeaders(token, options?.skipAuth),
      },
    });

    const result = await handleResponse<T>(response);
    log(`DELETE ${url} success`, result);
    return result;
  };

  const patch = async <T>(
    endpoint: string,
    data?: unknown,
    options?: { skipAuth?: boolean }
  ): Promise<T> => {
    const url = buildApiUrl(endpoint);
    log(`PATCH ${url}`, data);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeaders(token, options?.skipAuth),
      },
      body: JSON.stringify(data),
    });

    const result = await handleResponse<T>(response);
    log(`PATCH ${url} success`, result);
    return result;
  };

  return {
    get,
    post,
    put,
    delete: del,
    patch,
  };
};
