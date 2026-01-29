import { config } from '@/config';
import { useToken } from '@/hooks/useAuth';
import { ApolloProvider as Provider } from '@apollo/client/react';
import * as React from 'react';
import { createApolloClient } from './apolloClient';
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

export const ApolloProvider = ({ children }: { children: React.ReactNode }) => {
  const token = useToken();

  const httpUrl = React.useMemo(
    () => joinUrl(config.BASE_API_URL, '/graphql'),
    []
  );
  const wsUrl = React.useMemo(
    () => joinUrl(toWsUrl(config.BASE_API_URL), '/graphql'),
    []
  );

  const client = React.useMemo(() => {
    return createApolloClient({ httpUrl, wsUrl }, () => token ?? null);
  }, [httpUrl, wsUrl, token]);

  return <Provider client={client}>{children}</Provider>;
};
