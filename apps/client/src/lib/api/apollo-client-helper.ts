import { config } from '@/config';

const joinUrl = (base: string, path: string) => {
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
};

const toWsUrl = (httpUrl: string) => {
  try {
    const u = new URL(httpUrl);
    u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
    return u.toString();
  } catch {
    return httpUrl.replace(/^https?/i, m =>
      m.toLowerCase() === 'https' ? 'wss' : 'ws'
    );
  }
};

export const getGraphQLUrls = () => {
  const httpUrl = joinUrl(config.BASE_API_URL, '/graphql');
  const wsUrl = joinUrl(toWsUrl(config.BASE_API_URL), '/graphql');

  return { httpUrl, wsUrl };
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth-token');
};
