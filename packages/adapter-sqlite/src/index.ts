import Database, { type Database as DatabaseEngine } from "better-sqlite3";
import {
  Account,
  Adapter,
  Session,
  User,
  Verification,
} from "@ether-auth/core";

type SQLiteConfig =
  | {
      filename: string;
    }
  | {
      engine: DatabaseEngine;
    };

const getDatabase = (config: SQLiteConfig) =>
  "engine" in config ? config.engine : new Database(config.filename);

export const sqliteAdapter = (config: SQLiteConfig): Adapter => {
  const db = getDatabase(config);

  initialize(db);

  return {
    async createUser(payload) {
      return db
        .prepare(
          `INSERT INTO user (email, name, image) VALUES (?, ?, ?) RETURNING *`
        )
        .get(payload.email, payload.name, payload.image) as User;
    },

    async getUserBy(key, value) {
      return db
        .prepare(`SELECT * FROM user WHERE [${key}] = ?`)
        .get(value) as User | null;
    },

    async updateUser(id, payload) {
      return db
        .prepare(
          `UPDATE user SET ${Object.keys(payload)
            .map((key) => `[${key}] = ?`)
            .join(", ")} WHERE id = ? RETURNING *`
        )
        .get(...Object.values(payload), id) as User;
    },

    async deleteUser(id) {
      db.prepare("DELETE FROM user WHERE id = ?").run(id);
    },

    async createAccount(payload) {
      return db
        .prepare(
          `INSERT INTO account (userId, accountId, providerId, accessToken, refreshToken, password) VALUES (?, ?, ?, ?) RETURNING *`
        )
        .get(
          payload.userId,
          payload.accountId,
          payload.providerId,
          payload.accessToken,
          payload.refreshToken,
          payload.password ?? null
        ) as Account;
    },

    async getAccountBy(providerId, key, value) {
      return db
        .prepare(`SELECT * FROM account WHERE providerId = ? AND [${key}] = ?`)
        .get(providerId, value) as Account | null;
    },

    async deleteAccount(id) {
      db.prepare("DELETE FROM account WHERE id = ?").run(id);
    },

    async createSession(payload) {
      const rawSession = db
        .prepare(
          "INSERT INTO session (token, userId, expires) VALUES (?, ?, ?) RETURNING *"
        )
        .get(payload.token, payload.user.id, payload.expires) as Session;

      const session = await this.getSession(rawSession.token);
      if (!session) {
        throw new Error("Error while inserting");
      }

      return session;
    },

    async getSession(token) {
      const session = db
        .prepare("SELECT * FROM session WHERE token = ?")
        .get(token) as Omit<Session, "user"> & { userId: User["id"] };
      if (!session) {
        return null;
      }

      const { userId, ...restSession } = session;

      const user = await this.getUserBy("id", userId);
      if (!user) {
        return null;
      }

      return { ...restSession, user };
    },

    async updateSession(token, payload) {
      db.prepare(
        `UPDATE session SET ${Object.keys(payload)
          .map((key) => `[${key}] = ?`)
          .join(", ")} WHERE token = ?`
      ).run(...Object.values(payload), token);

      const session = await this.getSession(token);
      if (!session) {
        throw new Error("Issue while updating session");
      }

      return session as Session;
    },

    async clearSession(token) {
      db.prepare("DELETE FROM session WHERE token = ?").run(token);
    },

    async createVerification(payload) {
      return db
        .prepare(
          `INSERT INTO verification (token, extras, expires) VALUES (?, ?, ?) RETURNING *`
        )
        .get(payload.token, payload.extras, payload.expires) as Verification;
    },

    async getVerification(token) {
      return db
        .prepare("SELECT * FROM verification WHERE token = ?")
        .get(token) as Verification | null;
    },

    async deleteVerification(token) {
      db.prepare("DELETE FROM verification WHERE token = ?").run(token);
    },
  };
};

const initialize = (db: DatabaseEngine) => {
  db.exec(
    "CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, name TEXT, image TEXT)"
  );

  db.exec(
    "CREATE TABLE IF NOT EXISTS account (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, accountId TEXT NOT NULL, providerId TEXT NOT NULL, accessToken TEXT, refreshToken TEXT, password TEXT)"
  );

  db.exec(
    "CREATE TABLE IF NOT EXISTS session (token TEXT, userId INTEGER, expires INTEGER)"
  );

  db.exec(
    "CREATE TABLE IF NOT EXISTS verification (token TEXT, extras INTEGER, expires INTEGER)"
  );
};
