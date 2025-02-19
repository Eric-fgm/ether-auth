import type { CredentialsProvider } from "../providers";
import type { RequestContext } from "../types";

export default async (
  context: RequestContext,
  provider: CredentialsProvider
) => {
  try {
    const user = await provider.authorize(context);
    await context.hooks.signIn?.(context, user);

    return context.json(
      context.session
        ? await context.session.set(context, user)
        : await context.jwt.set(context, user)
    );
  } catch (error) {
    console.log(error);

    context.status(401).end();
  }
};
