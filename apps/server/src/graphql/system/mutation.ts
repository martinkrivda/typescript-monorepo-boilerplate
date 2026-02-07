export const systemMutationResolvers = {
  noop: (_: unknown, args: { message?: string }) =>
    args.message ?? "ok",
};
