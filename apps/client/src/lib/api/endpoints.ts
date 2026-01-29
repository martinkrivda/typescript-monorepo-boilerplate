import { config } from '@/config';

const apiPrefix = '/rest/v1' as const;

type QueryParams = Record<string, string | number | boolean | undefined | null>;
export const qs = (params?: QueryParams): string => {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    searchParams.append(key, String(value));
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

interface PaginationParams extends QueryParams {
  page?: number;
  limit?: number;
  q?: string;
}

export const ENDPOINTS = {
  health: (): string => `${apiPrefix}/health`,
  signIn: (): string => `${apiPrefix}/auth/signin`,
  signUp: (): string => `${apiPrefix}/auth/signup`,
  users: (params?: PaginationParams): string =>
    `${apiPrefix}/users${qs(params)}`,
  userDetail: (userId: string | number): string =>
    `${apiPrefix}/users/${userId}`,
} as const;

export type EndpointKey = keyof typeof ENDPOINTS;

export type EndpointParams<K extends EndpointKey> = Parameters<
  (typeof ENDPOINTS)[K]
>;

export const apiUrl = <K extends EndpointKey>(
  key: K,
  ...args: EndpointParams<K>
): string => {
  const endpointFn = ENDPOINTS[key] as (...args: unknown[]) => string;
  const relativePath = endpointFn(...args);

  const baseUrl = config.BASE_API_URL?.replace(/\/+$/, '') || '';
  return `${baseUrl}${relativePath}`;
};

export default ENDPOINTS;
