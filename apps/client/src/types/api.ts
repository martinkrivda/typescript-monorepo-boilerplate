import {
  isErrorEnvelope,
  isSuccessEnvelope,
} from '@repo/shared';
import type {
  ApiResponseEnvelope,
  ErrorEnvelope,
  ProblemFieldError,
  SuccessEnvelope,
} from '@repo/shared';

export type SuccessApiResponse<T = unknown> = SuccessEnvelope<T>;
export type ErrorApiResponse = ErrorEnvelope;
export type ValidationError = ProblemFieldError;
export type ValidationApiResponse = ErrorEnvelope & {
  error: ErrorEnvelope['error'] & { status: 422 };
};

export type ApiResponse<T = unknown> = ApiResponseEnvelope<T>;

export const isSuccessResponse = <T>(
  response: ApiResponse<T>
): response is SuccessApiResponse<T> => isSuccessEnvelope(response);

export const isErrorResponse = (
  response: ApiResponse
): response is ErrorApiResponse => isErrorEnvelope(response);

export const isValidationResponse = (
  response: ApiResponse
): response is ValidationApiResponse =>
  isErrorResponse(response) && response.error.status === 422;

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
