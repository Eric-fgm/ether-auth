import type { OAuthProvider } from "../providers";
import type { RequestContext } from "../types";

export default async (context: RequestContext, provider: OAuthProvider) => {
  const code = context.url.searchParams.get("code");
  if (!code) {
    return context.status(400).end();
  }

  const token = await provider.retrieveToken(code);
  const profile = await provider.retrieveProfile(token.accessToken);
  let [user, account] = await Promise.all([
    await context.adapter.getUserBy("email", profile.email),
    await context.adapter.getAccountBy(
      provider.id,
      "accountId",
      profile.id.toString()
    ),
  ]);

  if (!user) {
    user = await context.adapter.createUser({
      email: profile.email,
      image: profile.image,
      name: profile.name,
    });
    account = await context.adapter.createAccount({
      userId: user.id,
      accountId: profile.id.toString(),
      providerId: provider.id,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    });
  } else if (!account) {
    return context.status(403).end();
  }

  await context.hooks.oauth?.(context, user);

  return context.json(
    context.session
      ? await context.session.set(context, user)
      : await context.jwt.set(context, user)
  );
};
