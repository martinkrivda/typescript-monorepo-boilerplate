function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const systemSubscriptionResolvers = {
  ticks: {
    subscribe: async function* (
      _: unknown,
      args: { intervalMs?: number }
    ) {
      const intervalMs = Math.max(200, args.intervalMs ?? 1000);

      while (true) {
        await sleep(intervalMs);
        yield {
          ticks: {
            now: new Date().toISOString(),
          },
        };
      }
    },
  },
};
