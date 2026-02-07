import { systemMutationResolvers } from "./mutation";
import { systemQueryResolvers } from "./query";
import { systemTypeDefs } from "./schema";
import { systemSubscriptionResolvers } from "./subscription";

export const systemGraphQL = {
  typeDefs: systemTypeDefs,
  resolvers: {
    Query: systemQueryResolvers,
    Mutation: systemMutationResolvers,
    Subscription: systemSubscriptionResolvers,
  },
};
