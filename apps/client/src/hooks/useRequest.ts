import { config } from '@/config';
import type {
  RequestOptions,
  RequestState,
  UseRequestReturn,
} from '@/types/api';
import {
  buildApiUrl,
  createAuthHeaders,
  handleUnauthorized,
  parseApiResponse,
  SESSION_EXPIRED_MESSAGE,
  toApiError,
  unwrapApiResponse,
} from '@/lib/api/fetch-utils';
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

        const authHeaders = createAuthHeaders(token, skipAuth);

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

        const fullUrl = buildApiUrl(url);

        const response = await fetch(fullUrl, {
          method,
          headers: requestHeaders,
          signal: abortControllerRef.current.signal,
          ...fetchOptions,
        });

        handleUnauthorized(response, logout, skipAuth);

        if (response.status === 204) {
          setState((prev: RequestState<T>) => ({
            ...prev,
            data: undefined as T,
            isLoading: false,
            error: null,
          }));
          onSuccess?.(undefined as T);
          return;
        }

        const data = await parseApiResponse<T>(response);

        if (!response.ok) {
          throw toApiError(response, data);
        }

        log(`${method} ${url} success`, data);

        const responseData = unwrapApiResponse<T>(data);

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

        if (!errorMessage.includes(SESSION_EXPIRED_MESSAGE)) {
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
