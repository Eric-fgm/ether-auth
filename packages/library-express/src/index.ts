import etherAuth from "@ether-auth/core";
import type { Config } from "@ether-auth/core";
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";

export * from "@ether-auth/core";

const toRequestInternal = (req: ExpressRequest) => ({
  url: new URL(req.protocol + "://" + req.get("host") + req.originalUrl),
  baseUrl: req.baseUrl,
  body: req.body,
  headers: req.headers,
  method: req.method,
});

export const expressAuth = (config: Config) => {
  const { getSession, handler } = etherAuth(config);

  return {
    getSession: async (req: ExpressRequest, res: ExpressResponse) => {
      const response = await getSession(toRequestInternal(req));
      if (response.cookie !== undefined) {
        res.append("Set-Cookie", response.cookie);
      }
      return response.data;
    },

    middleware: async (
      req: ExpressRequest,
      res: ExpressResponse,
      next: NextFunction
    ) => {
      const response = await handler(toRequestInternal(req));

      if (response.hasSent) {
        if (response.cookie !== undefined) {
          res.append("Set-Cookie", response.cookie);
        }
        res.status(response.status);
        return response.data ? res.json(response.data) : res.end();
      }

      next();
    },
  };
};
