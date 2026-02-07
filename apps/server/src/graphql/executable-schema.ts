import { createSchema } from "graphql-yoga";

import { systemGraphQL } from "./system";

const baseTypeDefs = /* GraphQL */ `
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  type Subscription {
    _empty: String
  }
`;

export function createExecutableSchema() {
  return createSchema({
    typeDefs: [baseTypeDefs, systemGraphQL.typeDefs],
    resolvers: [systemGraphQL.resolvers],
  });
}
