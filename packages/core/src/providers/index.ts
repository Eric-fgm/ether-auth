import type { RequestContext, User } from "../types";

interface BaseProvider {
  id: string;
  name: string;
  type: string;
}

export interface OAuthProvider extends BaseProvider {
  authorizationUrl: string;
  accessTokenUrl: string;
  userInfoUrl: string;
  callbackUrl: string;
  type: "oauth";
  retrieveToken(
    code: string
  ): Promise<{ accessToken: string; refreshToken: string }>;
  retrieveProfile(accessToken: string): Promise<User>;
}

export interface MagicLinkProvider extends BaseProvider {
  callbackUrl: string;
  from: string;
  subject: string;
  type: "magic-link";
  body?: (redirectUrl: string) => string;
}

export interface CredentialsProvider extends BaseProvider {
  type: "credentials";
  authorize(context: RequestContext): Promise<User>;
  authenticate(context: RequestContext): Promise<User>;
}

export type Provider = OAuthProvider | MagicLinkProvider | CredentialsProvider;

export { default as googleProvider } from "./google";
export { default as githubProvider } from "./github";
export { default as emailPasswordProvider } from "./email-password";
