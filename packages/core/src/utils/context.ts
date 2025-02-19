import { memoryAdapter } from "../adapter";
import { createJWT } from "../jwt";
import { createSession } from "../session";
import type { Config, RequestContext, RequestInternal } from "../types";

export const getContext = (
  req: RequestInternal,
  config: Config
): RequestContext => {
  const adapter = config.adapter ?? memoryAdapter();
  const session = config.session ? createSession(config.session) : null;
  const jwt = config.jwt ? createJWT(config.jwt) : null;

  return {
    ...req,
    providers: config.providers,
    adapter,
    mailer: config.mailer,
    hooks: config.hooks ?? {},
    jwt: jwt as null,
    session: session as NonNullable<RequestContext["session"]>,
    state: {
      status: 200,
      data: null,
      hasSent: false,
    },
    status(status) {
      this.state.status = status;
      return { json: this.json.bind(this), end: this.end.bind(this) };
    },
    json(data) {
      this.state.status = 200;
      this.state.data = data;
      this.state.hasSent = true;
    },
    end() {
      this.state.hasSent = true;
    },
  };
};
