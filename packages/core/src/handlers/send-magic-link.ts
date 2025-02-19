import crypto from "node:crypto";
import type { MagicLinkProvider } from "../providers";
import type { RequestContext } from "../types";

export default async (context: RequestContext, provider: MagicLinkProvider) => {
  if (!context.mailer) {
    throw new Error("Mailer must be configured!");
  }

  const { email } = context.body;
  if (typeof email !== "string") {
    return context.status(400).end();
  }

  const verification = await context.adapter.createVerification({
    token: crypto.randomBytes(16).toString("hex"),
    extras: email,
    expires: Date.now() + 10 * 60 * 1000,
  });
  const hasSent = await context.mailer.send({
    to: email,
    from: provider.from,
    subject: provider.subject,
    body: provider.body?.(verification.token) ?? verification.token,
  });

  await context.hooks.sendMagicLink?.(context);

  return context.status(hasSent ? 200 : 500).end();
};
