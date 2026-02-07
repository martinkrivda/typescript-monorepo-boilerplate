import { config } from '@/config';
import {
  isErrorResponse,
  isSuccessResponse,
  isValidationResponse,
} from '@/types/api';
import type { ApiResponse } from '@/types/api';

export const SESSION_EXPIRED_MESSAGE = 'Session expired. Please sign in again.';

export const buildApiUrl = (endpoint: string): string =>
  `${config.BASE_API_URL}${endpoint}`;

export const createAuthHeaders = (
  token: string | null,
  skipAuth: boolean = false
): Record<string, string> =>
  !skipAuth && token ? { Authorization: `Bearer ${token}` } : {};

export const handleUnauthorized = (
  response: Response,
  logout: () => void,
  skipAuth: boolean = false
) => {
  if (response.status === 401 && !skipAuth) {
    logout();
    throw new Error(SESSION_EXPIRED_MESSAGE);
  }
};

export const parseApiResponse = async <T>(
  response: Response
): Promise<ApiResponse<T> | null> => {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json() as Promise<ApiResponse<T>>;
  }
  return null;
};

export const parseValidationErrors = (data: ApiResponse<unknown>): string => {
  if (!isValidationResponse(data) || data.error.errors.length === 0) {
    return '';
  }

  return data.error.errors
    .map(err => `${err.field ?? 'field'}: ${err.message}`)
    .join(', ');
};

export const toApiError = (
  response: Response,
  data: ApiResponse<unknown> | null
): Error => {
  if (data) {
    const validationMessage = parseValidationErrors(data);
    if (validationMessage) {
      return new Error(validationMessage);
    }

    if (isErrorResponse(data)) {
      return new Error(data.error.detail || data.error.title);
    }
  }

  return new Error(`Request failed with status ${response.status}`);
};

export const unwrapApiResponse = <T>(data: ApiResponse<T> | null): T => {
  if (!data || !isSuccessResponse(data)) {
    throw new Error('Invalid API response format');
  }

  return data.data as T;
};
