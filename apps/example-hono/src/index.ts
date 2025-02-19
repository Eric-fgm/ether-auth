import { emailPasswordProvider, honoAuth } from "@ether-auth/hono";
import { sqliteAdapter } from "@ether-auth/sqlite";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

const port = process.env.PORT || 5002;
const app = new Hono();

app.use(
  "/auth/*",
  honoAuth({
    providers: [emailPasswordProvider()],
    adapter: sqliteAdapter({ filename: "database.db" }),
    session: {
      secret: "private-key",
      cookie: {
        maxAge: 7 * 24 * 3600,
      },
    },
  }).middleware
);

serve(
  {
    fetch: app.fetch,
    port: port as number,
  },
  (info) => {
    console.log(`hono api running on ${info.port}`);
  }
);
