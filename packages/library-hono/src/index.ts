import etherAuth from "@ether-auth/core";
import type { Config } from "@ether-auth/core";
import type { Context, Next } from "hono";
import type { StatusCode } from "hono/utils/http-status";

export * from "@ether-auth/core";

const getJSONBody = async (c: Context) => {
  try {
    const body = await c.req.json();
    return typeof body === "object" ? body : {};
  } catch (error) {
    console.log(error);
    return {};
  }
};

const toRequestInternal = async (c: Context) => ({
  url: new URL(c.req.url),
  baseUrl: c.req.routePath.endsWith("/*")
    ? c.req.routePath.slice(0, -2)
    : c.req.routePath,
  body: await getJSONBody(c),
  headers: Object.fromEntries(c.req.raw.headers.entries()),
  method: c.req.method,
});

export const honoAuth = (config: Config) => {
  const { getSession, handler } = etherAuth(config);

  return {
    getSession: async (c: Context) => {
      const response = await getSession(await toRequestInternal(c));
      if (response.cookie !== undefined) {
        c.res.headers.append("Set-Cookie", response.cookie);
      }
      return response.data;
    },

    middleware: async (c: Context, next: Next) => {
      const response = await handler(await toRequestInternal(c));

      if (response.hasSent) {
        if (response.cookie !== undefined) {
          c.res.headers.append("Set-Cookie", response.cookie);
        }
        c.status(response.status as StatusCode);
        return response.data ? c.json(response.data) : c.body(null);
      }

      await next();
    },
  };
};
