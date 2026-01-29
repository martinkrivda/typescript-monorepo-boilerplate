export interface BaseApiResponse {
  message: string;
  error: boolean;
  code: number;
}

export interface SuccessApiResponse<T = unknown> extends BaseApiResponse {
  error: false;
  results: T;
}

export interface ErrorApiResponse extends BaseApiResponse {
  error: true;
  results?: never;
}

export interface ValidationError {
  msg: string;
  param: string;
}

export interface ValidationApiResponse extends BaseApiResponse {
  error: true;
  code: 422;
  message: 'Validation errors';
  errors: ValidationError[];
}

export type ApiResponse<T = unknown> =
  | SuccessApiResponse<T>
  | ErrorApiResponse
  | ValidationApiResponse;

export const isSuccessResponse = <T>(
  response: ApiResponse<T>
): response is SuccessApiResponse<T> =>
  !response.error && 'results' in response;

export const isErrorResponse = (
  response: ApiResponse
): response is ErrorApiResponse => response.error && response.code !== 422;

export const isValidationResponse = (
  response: ApiResponse
): response is ValidationApiResponse =>
  response.error && response.code === 422 && 'errors' in response;

export interface RequestState<T = unknown> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface RequestOptions extends RequestInit {
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
  skipAuth?: boolean;
}

export interface UseRequestReturn<T = unknown> extends RequestState<T> {
  request: (url: string, options?: RequestOptions) => Promise<void>;
  clearError: () => void;
  clearData: () => void;
}

export interface UseFetchRequestReturn<T = unknown>
  extends UseRequestReturn<T> {
  refetch: (optionsUpdate?: RequestOptions) => void;
}
