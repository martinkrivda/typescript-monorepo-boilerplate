export const systemTypeDefs = /* GraphQL */ `
  type SystemInfo {
    name: String!
    version: String!
    now: String!
  }

  type TickEvent {
    now: String!
  }

  extend type Query {
    ping: String!
    serverTime: String!
    systemInfo: SystemInfo!
  }

  extend type Mutation {
    noop(message: String): String!
  }

  extend type Subscription {
    ticks(intervalMs: Int = 1000): TickEvent!
  }
`;
