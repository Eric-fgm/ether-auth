import {
  getOAuth,
  getProviders,
  signIn,
  signOut,
  signUp,
  sendMagicLink,
  verifyMagicLink,
} from "./handlers";
import { getContext } from "./utils";
import type {
  CredentialsProvider,
  MagicLinkProvider,
  OAuthProvider,
} from "./providers";
import type { Config, RequestInternal, Session } from "./types";

export * from "./providers";
export * from "./adapter";
export type * from "./types";

export default (config: Config) => {
  if (!config.jwt && !config.session) {
    throw new Error("Session or JWT must be set!");
  }

  return {
    getSession: async (req: RequestInternal) => {
      const context = getContext(req, config);
      let session = null;

      if (context.session) {
        session = await context.session.get(context);
        if (session) {
          const currentTimestamp = Date.now();
          const sessionMaxAge = config.session?.cookie?.maxAge ?? 7 * 24 * 3600;
          const sessionUpdateAge = config.session?.updateAge ?? 3600;
          // Calculate last updated date to throttle write updates to database
          // Formula: ({expiry date} - sessionMaxAge) + sessionUpdateAge
          //     e.g. ({expiry date} - 30 days) + 1 hour
          const sessionIsDueToBeUpdatedDate =
            session.expires - sessionMaxAge * 1000 + sessionUpdateAge * 1000;

          if (sessionIsDueToBeUpdatedDate <= currentTimestamp) {
            session = await context.session.reset(context);
          }
        }
      } else {
        session = await context.jwt.get(context);
      }

      if (session) {
        context.json(session);
      }

      return context.state as typeof context.state & {
        data: Session | null;
      };
    },

    handler: async (req: RequestInternal) => {
      const context = getContext(req, config);

      const endpoint = req.url.pathname.startsWith(req.baseUrl)
        ? req.url.pathname.slice(req.baseUrl.length + 1)
        : req.url.pathname;

      if (req.method === "GET") {
        if (endpoint === "providers") {
          await getProviders(context);
        }

        const oauthProvider = context.providers.find(
          (provider): provider is OAuthProvider =>
            provider.type === "oauth" && `callback/${provider.id}` === endpoint
        );
        if (oauthProvider) {
          await getOAuth(context, oauthProvider);
        }
      } else if (req.method === "POST") {
        const signInCredentialsProvider = context.providers.find(
          (provider): provider is CredentialsProvider =>
            provider.type === "credentials" &&
            `sign-in/${provider.id}` === endpoint
        );
        if (signInCredentialsProvider) {
          await signIn(context, signInCredentialsProvider);
        }

        if (endpoint === "sign-out") {
          await signOut(context);
        }

        const signUpCredentialsProvider = context.providers.find(
          (provider): provider is CredentialsProvider =>
            provider.type === "credentials" &&
            `sign-up/${provider.id}` === endpoint
        );
        if (signUpCredentialsProvider) {
          await signUp(context, signUpCredentialsProvider);
        }

        const sendMagicLinkProvider = context.providers.find(
          (provider): provider is MagicLinkProvider =>
            provider.type === "magic-link" && `send/${provider.id}` === endpoint
        );
        if (sendMagicLinkProvider) {
          await sendMagicLink(context, sendMagicLinkProvider);
        }

        const verifyMagicLinkProvider = context.providers.find(
          (provider): provider is MagicLinkProvider =>
            provider.type === "magic-link" &&
            `verify/${provider.id}` === endpoint
        );
        if (verifyMagicLinkProvider) {
          await verifyMagicLink(context, verifyMagicLinkProvider);
        }
      }

      return context.state;
    },
  };
};
