import type { CredentialsProvider } from "../providers";
import type { RequestContext } from "../types";

export default async (
  context: RequestContext,
  provider: CredentialsProvider
) => {
  const user = await provider.authenticate(context);
  await context.hooks.signUp?.(context, user);

  return context.json(user);
};
