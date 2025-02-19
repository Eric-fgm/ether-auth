import type { CredentialsProvider } from "../providers";
import type { RequestContext } from "../types";

export default async (
  context: RequestContext,
  provider: CredentialsProvider
) => {
  const code = context.url.searchParams.get("code");
  if (!code) {
    return context.status(400).end();
  }

  const verification = await context.adapter.getVerification(code);
  if (verification) {
    await context.adapter.deleteVerification(verification.token);
  }
  if (!verification || Date.now() > verification.expires) {
    return context.status(403).end();
  }

  const user = await context.adapter.getUserBy("email", verification.extras);
  const account = user
    ? await context.adapter.getAccountBy(
        provider.id,
        "accountId",
        user.id.toString()
      )
    : null;

  if (!user || !account) {
    return context.status(403).end();
  }

  const updatedUser = await context.adapter.updateUser(user.id, {
    emailVerifiedAt: Date.now(),
  });

  await context.hooks.verifySignUp?.(context, updatedUser);

  return context.json(
    context.session
      ? await context.session.set(context, updatedUser)
      : await context.jwt.set(context, updatedUser)
  );
};
