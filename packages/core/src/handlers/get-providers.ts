import type { RequestContext } from "../types";

export default async (context: RequestContext) => {
  const providersFromHook = await context.hooks.providers?.(context);

  context.json(
    providersFromHook
      ? providersFromHook
      : context.providers.map((provider) => ({
          id: provider.id,
          name: provider.name,
          type: provider.type,
          ...(provider.type === "oauth" && {
            redirectUrl: provider.authorizationUrl,
          }),
        }))
  );
};
