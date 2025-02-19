import { Adapter } from "./adapter";
import { JWTConfig } from "./jwt";
import { Provider } from "./providers";
import { SessionConfig } from "./session";

/* 
   User interface represent user table.
   Field "email" is unique.
*/
export interface User {
  id: number | string;
  email: string;
  emailVerifiedAt?: number;
  name?: string;
  image?: string;
}

/* 
   Account interface represent account table.
   Field "accountId" is unique.
*/
export interface Account {
  id: number | string;
  userId: User["id"];
  accountId: string;
  providerId: string;
  accessToken?: string;
  refreshToken?: string;
  password?: string;
}

/* 
   Session interface represent user session.
   Field "expires" is a timestamp.
   Field "token" is a session ID.
*/
export interface Session {
  token: string;
  user: User;
  expires: number;
}

/* 
   Verification interface represent verification table.
   Field "expires" is a timestamp.
   Field "token" is generated.
*/
export interface Verification {
  token: string;
  extras: string;
  expires: number;
}

/*
    Mailer interface used to send verification / forgot password emails.
*/
export interface Mailer {
  send(payload: {
    to: string;
    from: string;
    subject: string;
    body: string;
  }): Promise<boolean>;
}

export interface Hooks {
  signUp?: (context: RequestContext, user: User) => Promise<void>;
  verifySignUp?: (context: RequestContext, user: User) => Promise<void>;
  signIn?: (context: RequestContext, user: User) => Promise<void>;
  signOut?: (context: RequestContext, user: User) => Promise<void>;
  sendMagicLink?: (context: RequestContext) => Promise<void>;
  verifyMagicLink?: (context: RequestContext, user: User) => Promise<void>;
  oauth?: (context: RequestContext, user: User) => Promise<void>;
  providers?: (context: RequestContext) => Promise<unknown>;
}

export interface Config {
  providers: Provider[];
  adapter?: Adapter;
  mailer?: Mailer;
  session?: SessionConfig;
  jwt?: JWTConfig;
  hooks?: Hooks;
}

export interface RequestInternal {
  url: URL;
  baseUrl: string;
  method: string;
  headers: Record<string, string[] | string | undefined>;
  body: Record<string, number | string | undefined | null>;
}

export type RequestContext = RequestInternal & {
  providers: Provider[];
  adapter: Adapter;
  mailer?: Mailer;
  hooks: Hooks;
  state: {
    status: number;
    data: unknown;
    hasSent: boolean;
    cookie?: string;
  };
  status: (status: number) => {
    json: RequestContext["json"];
    end: RequestContext["end"];
  };
  json: (data: unknown) => void;
  end: () => void;
} & (
    | {
        jwt: {
          get: (
            context: RequestContext
          ) => Promise<{ token: string; user: User } | null>;
          set: (
            context: RequestContext,
            payload: User
          ) => Promise<{ token: string; user: User }>;
        };
        session: null;
      }
    | {
        jwt: null;
        session: {
          get: (context: RequestContext) => Promise<Session | null>;
          set: (context: RequestContext, user: User) => Promise<Session>;
          reset: (context: RequestContext) => Promise<Session | null>;
          clear: (context: RequestContext) => Promise<void>;
        };
      }
  );
