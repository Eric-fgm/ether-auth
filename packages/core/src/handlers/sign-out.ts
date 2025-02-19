import type { RequestContext } from "../types";

export default async (context: RequestContext) => {
  if (context.session) {
    const session = await context.session.get(context);
    if (!session) {
      return context.status(401).end();
    }
    await context.session.clear(context);
    await context.hooks.signOut?.(context, session.user);
  }
  return context.end();
};
