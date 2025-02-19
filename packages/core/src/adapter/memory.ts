import type { Adapter } from ".";
import type { Account, Session, User, Verification } from "../types";

let usersIncrementor = 1;
let accountsIncrementor = 1;
const state: {
  users: Record<User["id"], User>;
  accounts: Record<Account["id"], Account>;
  session: Record<Session["token"], Session>;
  verification: Record<Verification["token"], Verification>;
} = {
  users: {},
  accounts: {},
  session: {},
  verification: {},
};

export default (): Adapter => {
  return {
    async createUser(payload) {
      const id = usersIncrementor;
      usersIncrementor++;
      const user = { id, ...payload };
      state.users[id] = user;

      return user;
    },

    async getUserBy(key, value) {
      const userEntry = Object.entries(state.users).find(
        (entry) => entry[1][key] === value
      );

      return userEntry ? userEntry[1] : null;
    },

    async updateUser(id, payload) {
      const user = state.users[id];
      if (!user) {
        throw new Error("Not found user");
      }

      state.users[id] = { ...user, ...payload };
      return state.users[id];
    },

    async deleteUser(id) {
      delete state.users[id];
    },

    async createAccount(payload) {
      const id = accountsIncrementor;
      accountsIncrementor++;
      const account = { id, ...payload };
      state.accounts[id] = account;

      return account;
    },

    async getAccountBy(providerId, key, value) {
      const accountEntry = Object.entries(state.accounts).find(
        (entry) => entry[1].providerId === providerId && entry[1][key] === value
      );

      return accountEntry ? accountEntry[1] : null;
    },

    async deleteAccount(id) {
      delete state.accounts[id];
    },

    async createSession(payload) {
      state.session[payload.token] = payload;

      return payload;
    },

    async getSession(token) {
      return state.session[token] ?? null;
    },

    async updateSession(token, payload) {
      const session = state.session[token];
      if (!session) {
        throw new Error("Not found session");
      }

      state.session[token] = { ...session, ...payload };
      return state.session[token];
    },

    async clearSession(token) {
      delete state.session[token];
    },

    async getVerification(token) {
      return state.verification[token] ?? null;
    },

    async createVerification(payload) {
      state.verification[payload.token] = payload;

      return payload;
    },

    async deleteVerification(token) {
      delete state.verification[token];
    },
  };
};
