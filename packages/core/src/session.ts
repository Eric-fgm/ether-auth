import crypto from "node:crypto";
import { parseCookie, serializeCookie } from "./utils";
import type { RequestContext, User } from "./types";

export interface SessionConfig {
  secret: string;
  updateAge?: number;
  name?: string;
  cookie?: {
    path?: string;
    domain?: string;
    httpOnly?: boolean;
    secure?: boolean;
    maxAge?: number;
    sameSite?: boolean | "lax" | "strict" | "none";
  };
}

export const createSession = (config: SessionConfig) => {
  const { name = "auth.session.id" } = config;
  const cookieOptions = {
    path: "/",
    httpOnly: true,
    maxAge: 7 * 24 * 3600,
    sameSite: "lax" as const,
    ...config.cookie,
  };

  return {
    async set(context: RequestContext, user: User) {
      const currentSession = await this.get(context);
      if (currentSession && currentSession.user.id === user.id) {
        return currentSession;
      }

      const sessionId = crypto.randomBytes(32).toString("hex");
      const createdAt = Date.now();

      const createdSession = await context.adapter.createSession({
        token: sessionId,
        user,
        expires: createdAt + cookieOptions.maxAge * 1000,
      });
      context.state.cookie = serializeCookie(
        name,
        createdSession.token,
        cookieOptions
      );

      return createdSession;
    },
    async get(context: RequestContext) {
      const cookies = parseCookie((context.headers.cookie ?? "") as string);
      const sessionId = cookies[name];
      if (!sessionId) {
        return null;
      }

      const session = await context.adapter.getSession(sessionId);
      if (!session || session.expires < Date.now()) {
        await context.adapter.clearSession(sessionId);
        return null;
      }

      return session;
    },
    async reset(context: RequestContext) {
      const cookies = parseCookie((context.headers.cookie ?? "") as string);
      const sessionId = cookies[name];
      const createdAt = Date.now();
      if (!sessionId) {
        return null;
      }

      const session = await context.adapter.updateSession(sessionId, {
        expires: createdAt + cookieOptions.maxAge * 1000,
      });
      context.state.cookie = serializeCookie(
        name,
        session.token,
        cookieOptions
      );

      return session;
    },
    async clear(context: RequestContext) {
      const cookies = parseCookie((context.headers.cookie ?? "") as string);
      const sessionId = cookies[name];

      if (sessionId) {
        await context.adapter.clearSession(sessionId);
        context.state.cookie = serializeCookie(name, "", {
          ...cookieOptions,
          maxAge: 0,
        });
      }
    },
  };
};
