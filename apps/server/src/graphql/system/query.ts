import packageJSON from "../../../package.json" with { type: "json" };

export const systemQueryResolvers = {
  ping: () => "pong",
  serverTime: () => new Date().toISOString(),
  systemInfo: () => ({
    name: "server-template",
    version: packageJSON.version ?? "0.0.0",
    now: new Date().toISOString(),
  }),
};
