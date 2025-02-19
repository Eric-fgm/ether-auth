import type { Account, Session, User, Verification } from "../types";

export { default as memoryAdapter } from "./memory";

/* 
   Adapter interface used to store users, account, sessions and verifications.
*/
export interface Adapter {
  createUser(payload: Omit<User, "id">): Promise<User>;
  getUserBy<K extends keyof User>(key: K, value: User[K]): Promise<User | null>;
  updateUser(id: User["id"], payload: Partial<Omit<User, "id">>): Promise<User>;
  deleteUser(id: User["id"]): Promise<void>;

  createAccount(payload: Omit<Account, "id">): Promise<Account>;
  getAccountBy<K extends keyof Account>(
    providerId: string,
    key: K,
    value: Account[K]
  ): Promise<Account | null>;
  deleteAccount(id: Account["id"]): Promise<void>;

  createSession(payload: Session): Promise<Session>;
  getSession(token: Session["token"]): Promise<Session | null>;
  updateSession(
    token: Session["token"],
    payload: Partial<Omit<Session, "token">>
  ): Promise<Session>;
  clearSession(token: Session["token"]): Promise<void>;

  createVerification(payload: Verification): Promise<Verification>;
  getVerification(token: Verification["token"]): Promise<Verification | null>;
  deleteVerification(token: Verification["token"]): Promise<void>;
}
