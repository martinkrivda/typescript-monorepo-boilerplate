import { config } from '@/config';
import type {
  ApiResponse,
  RequestOptions,
  RequestState,
  UseRequestReturn,
  ValidationApiResponse,
} from '@/types/api';
import { useCallback, useRef, useState } from 'react';
import { toast } from '@/utils';
import { useAuthForRequest } from './useAuth';

const log = config.REQUEST_LOGGING
  ? (message: string, ...args: unknown[]) => {
      console.info(`[API] ${message}`, ...args);
    }
  : () => {};
const normalizeHeaders = (headers: HeadersInit = {}): Record<string, string> => {
  if (headers instanceof Headers) {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  if (Array.isArray(headers)) {
    const result: Record<string, string> = {};
    headers.forEach(([key, value]) => {
      result[key] = value;
    });
    return result;
  }

  return headers as Record<string, string>;
};

export const useRequest = <T = unknown>(
  initialState: Partial<RequestState<T>> = {}
): UseRequestReturn<T> => {
  const { token, logout } = useAuthForRequest();
  const [state, setState] = useState<RequestState<T>>({
    data: null,
    isLoading: false,
    error: null,
    ...initialState,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const clearError = useCallback(() => {
    setState((prev: RequestState<T>) => ({ ...prev, error: null }));
  }, []);

  const clearData = useCallback(() => {
    setState((prev: RequestState<T>) => ({ ...prev, data: null }));
  }, []);

  const request = useCallback(
    async (url: string, options: RequestOptions = {}) => {
      const {
        method = 'GET',
        headers = {},
        onSuccess,
        onError,
        skipAuth = false,
        ...fetchOptions
      } = options;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort('New request started');
      }

      abortControllerRef.current = new AbortController();

      log(`${method} ${url}`, options);

      setState((prev: RequestState<T>) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const normalizedHeaders = normalizeHeaders(headers);

        const authHeaders =
          !skipAuth && token ? { Authorization: `Bearer ${token}` } : {};

        const requestHeaders: Record<string, string> = {
          ...authHeaders,
          ...normalizedHeaders,
        };

        if (
          !(fetchOptions.body instanceof FormData) &&
          !requestHeaders['Content-Type']
        ) {
          requestHeaders['Content-Type'] = 'application/json';
        }

        const fullUrl = `${config.BASE_API_URL}${url}`;

        const response = await fetch(fullUrl, {
          method,
          headers: requestHeaders,
          signal: abortControllerRef.current.signal,
          ...fetchOptions,
        });

        if (response.status === 401 && !skipAuth) {
          logout();
          throw new Error('Session expired. Please sign in again.');
        }

        let data: ApiResponse<T>;

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = {} as ApiResponse<T>;
        }

        if (!response.ok) {
          const validationData = data as ValidationApiResponse;
          if (validationData.errors) {
            throw new Error(
              validationData.errors
                .map(
                  (err: { msg: string; param: string }) =>
                    `${err.msg}: ${err.param}`
                )
                .join(', ')
            );
          }

          throw new Error(
            data.message || `Request failed with status ${response.status}`
          );
        }

        log(`${method} ${url} success`, data);

        const responseData = 'results' in data ? data.results : data;

        setState((prev: RequestState<T>) => ({
          ...prev,
          data: responseData as T,
          isLoading: false,
          error: null,
        }));

        onSuccess?.(responseData as T);
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred';

        log(`${method} ${url} error`, error);

        setState((prev: RequestState<T>) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        if (!errorMessage.includes('Session expired')) {
          toast({
            title: 'Request Failed',
            description: errorMessage,
            variant: 'error',
          });
        }

        onError?.(errorMessage);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [token, logout]
  );

  return {
    ...state,
    request,
    clearError,
    clearData,
  };
};
