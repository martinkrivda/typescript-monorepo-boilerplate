import { randomUUID } from "node:crypto";
import type { Server as HTTPServer } from "node:http";

import { createYoga } from "graphql-yoga";
import { useServer } from "graphql-ws/use/ws";
import { WebSocketServer } from "ws";

import type { GraphQLContext } from "./context";

import {
  getAuthorizationFromConnectionParams,
  resolveUserFromAuthorization,
} from "./context";
import { createExecutableSchema } from "./executable-schema";

const schema = createExecutableSchema();

export const yoga = createYoga<{ requestId?: string }>({
  schema,
  graphqlEndpoint: "/graphql",
  context: async ({ request, extra }): Promise<GraphQLContext> => {
    const user = await resolveUserFromAuthorization(
      request.headers.get("authorization") ?? undefined
    );

    return {
      requestId: extra.requestId ?? randomUUID(),
      user,
    };
  },
});

export function attachGraphQLWebSocketServer(server: HTTPServer) {
  const wsServer = new WebSocketServer({
    server,
    path: "/graphql",
  });

  const cleanup = useServer(
    {
      schema,
      context: async (ctx): Promise<GraphQLContext> => {
        const authorization = getAuthorizationFromConnectionParams(
          ctx.connectionParams
        );
        const user = await resolveUserFromAuthorization(authorization);

        if (!user) {
          throw new Error("Unauthorized");
        }

        return {
          requestId: randomUUID(),
          user,
        };
      },
    },
    wsServer
  );

  return () => {
    cleanup.dispose();
    wsServer.close();
  };
}
