import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

declare global {
  var __appDb: Database.Database | undefined;
}

function getDatabasePath() {
  return process.env.SQLITE_DB_PATH || path.join(process.cwd(), "data", "app.db");
}

function migrate(db: Database.Database) {
  db.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS rate_limit_entries (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL,
      reset_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS callback_requests (
      id TEXT PRIMARY KEY,
      phone_number TEXT NOT NULL,
      consent INTEGER NOT NULL,
      source TEXT NOT NULL,
      ip TEXT NOT NULL,
      request_type TEXT NOT NULL,
      status TEXT NOT NULL,
      scheduled_for TEXT,
      call_sid TEXT,
      last_error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_callback_requests_status_scheduled_for
      ON callback_requests(status, scheduled_for);

    CREATE TABLE IF NOT EXISTS cta_events (
      id TEXT PRIMARY KEY,
      event_name TEXT NOT NULL,
      cta_id TEXT NOT NULL,
      href TEXT,
      source TEXT NOT NULL,
      metadata_json TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

export function getDb() {
  if (global.__appDb) {
    return global.__appDb;
  }

  const dbPath = getDatabasePath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma("busy_timeout = 5000");
  migrate(db);

  global.__appDb = db;
  return db;
}
