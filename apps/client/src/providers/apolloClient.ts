import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  split,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { createClient } from 'graphql-ws';
import { getGraphQLUrls, getToken } from '@/lib/api/apollo-client-helper';

export type ApolloUrls = {
  httpUrl: string;
  wsUrl?: string;
};

export type GetTokenFn = () => string | null;
const toWsUrl = (httpUrl: string): string => {
  try {
    const url = new URL(httpUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.toString();
  } catch {
    return httpUrl.replace(/^https:/i, 'wss:').replace(/^http:/i, 'ws:');
  }
};

const createApolloLink = (
  urls: ApolloUrls,
  getTokenFn: GetTokenFn
): ApolloLink => {
  const httpLink = new HttpLink({
    uri: urls.httpUrl,
    credentials: 'include',
  });

  const authLink = setContext((_, previousContext) => {
    const token = getTokenFn();
    const headers = (previousContext.headers ?? {}) as Record<string, string>;

    return {
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  });

  const errorLink = onError(({ error, operation }) => {
    if (CombinedGraphQLErrors.is(error)) {
      console.warn(
        `[GQL errors] ${operation.operationName ?? 'unknown'}`,
        error.errors
      );
      return;
    }

    console.error('[Network error]', error);
  });

  let wsLink: ApolloLink | null = null;

  if (typeof window !== 'undefined') {
    const wsUrl = urls.wsUrl ?? toWsUrl(urls.httpUrl);

    const wsClient = createClient({
      url: wsUrl,
      lazy: true,
      connectionParams: () => {
        const token = getTokenFn();
        return token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : {};
      },
    });

    wsLink = new GraphQLWsLink(wsClient);
  }

  const splitLink = wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },
        wsLink,
        httpLink
      )
    : httpLink;

  return ApolloLink.from([errorLink, authLink, splitLink]);
};
export const createApolloClient = (
  urls: ApolloUrls,
  getTokenFn: GetTokenFn
): ApolloClient => {
  const link = createApolloLink(urls, getTokenFn);

  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {},
      },
    },
  });

  return new ApolloClient({
    link,
    cache,
  });
};

const { httpUrl, wsUrl } = getGraphQLUrls();

export const apolloClient = createApolloClient({ httpUrl, wsUrl }, getToken);
