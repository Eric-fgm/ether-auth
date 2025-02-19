import type { MagicLinkProvider } from "../providers";
import type { RequestContext } from "../types";

export default async (context: RequestContext, provider: MagicLinkProvider) => {
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

  let user = await context.adapter.getUserBy("email", verification.extras);
  let account = user
    ? await context.adapter.getAccountBy(
        provider.id,
        "accountId",
        user.id.toString()
      )
    : null;

  if (!user) {
    user = await context.adapter.createUser({
      email: verification.extras,
    });
    account = await context.adapter.createAccount({
      userId: user.id,
      accountId: user.id.toString(),
      providerId: provider.id,
    });
  } else if (!account) {
    return context.status(403).end();
  }

  await context.hooks.verifyMagicLink?.(context, user);

  return context.json(
    context.session
      ? await context.session.set(context, user)
      : await context.jwt.set(context, user)
  );
};
