import bcrypt from "bcrypt";
import crypto from "node:crypto";
import type { CredentialsProvider } from ".";

export default (config?: {
  emailVerification?: { from: string; subject: string };
}): CredentialsProvider => ({
  id: "email",
  name: "Email & Password",
  type: "credentials",
  async authorize(context) {
    const { email, password } = context.body;
    if (typeof email !== "string" || typeof password !== "string") {
      throw new Error("Bad Request");
    }

    const user = await context.adapter.getUserBy("email", email);
    if (!user) {
      throw new Error("Not Found");
    }

    const account = await context.adapter.getAccountBy(
      this.id,
      "accountId",
      user.id.toString()
    );

    if (
      !account ||
      !account.password ||
      !bcrypt.compareSync(password, account.password)
    ) {
      throw new Error("Bad Password");
    }

    return user;
  },
  async authenticate(context) {
    const shouldSendVerification =
      !!context.mailer && !!config?.emailVerification;
    const { email, password } = context.body;
    if (typeof email !== "string" || typeof password !== "string") {
      throw new Error("Bad Request");
    }

    const user = await context.adapter.getUserBy("email", email);
    if (user) {
      throw new Error("Already exists");
    }

    const createdUser = await context.adapter.createUser({
      email,
      emailVerifiedAt: shouldSendVerification ? undefined : Date.now(),
    });
    await context.adapter.createAccount({
      providerId: this.id,
      accountId: createdUser.id.toString(),
      userId: createdUser.id,
      password: bcrypt.hashSync(password, 10),
    });

    if (shouldSendVerification) {
      const verification = await context.adapter.createVerification({
        token: crypto.randomBytes(16).toString("hex"),
        extras: email,
        expires: Date.now() + 10 * 60 * 1000,
      });
      context.mailer!.send({
        to: email,
        from: config.emailVerification!.from,
        subject: config.emailVerification!.subject,
        body: verification.token,
      });
    }

    return createdUser;
  },
});
