import jwt from "jsonwebtoken";
import type { RequestContext, User } from "./types";

export interface JWTConfig {
  secret: string;
}

export const createJWT = (config: JWTConfig) => ({
  get: async (context: RequestContext) => {
    const accessToken = context.headers.authorization;
    if (typeof accessToken !== "string" || !accessToken.startsWith("Bearer ")) {
      return null;
    }

    const payload = jwt.verify(accessToken.split(" ")[1], config.secret);
    if (!payload || typeof payload !== "object" || !("id" in payload)) {
      return null;
    }
    const user = await context.adapter.getUserBy("id", payload.id);

    return user ? { token: accessToken, user } : null;
  },
  set: async (_: RequestContext, payload: User) => ({
    token: jwt.sign(payload, config.secret, { expiresIn: "10h" }),
    user: payload,
  }),
});
