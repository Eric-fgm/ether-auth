import { emailPasswordProvider, expressAuth } from "@ether-auth/express";
import { createServer } from "./server";

const port = process.env.PORT || 5001;
const server = createServer();

const auth = expressAuth({
  providers: [emailPasswordProvider()],
  session: { secret: "private-key" },
  hooks: {
    async oauth(context, user) {
      console.log(user);
    },
    async providers(context) {
      return [
        ...context.providers,
        { id: "provider", name: "Schrödinger's Provider" },
      ];
    },
  },
});

server.use("/auth", auth.middleware);

server.get("/auth/me", async (req, res) => {
  const user = await auth.getSession(req, res);
  return res.json(user);
});

server.listen(port, () => {
  console.log(`express api running on ${port}`);
});

declare module "@ether-auth/express" {
  export interface User {
    xd: string;
  }
}
