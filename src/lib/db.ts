import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "homework.db");

let db: Database.Database | null = null;

function tableExists(database: Database.Database, name: string): boolean {
  const row = database
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(name);
  return !!row;
}

function migrateSchema(database: Database.Database) {
  if (!tableExists(database, "groups")) return;

  const groupsCols = database.pragma("table_info(groups)") as { name: string }[];
  const hasCode = groupsCols.some((c) => c.name === "code");
  const hasGroupsNew = tableExists(database, "groups_new");

  if (!hasCode && !hasGroupsNew) return;

  database.pragma("foreign_keys = OFF");

  try {
    database.exec("BEGIN");

    if (hasCode) {
      if (!hasGroupsNew) {
        database.exec(`
          CREATE TABLE groups_new (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
          );
          INSERT OR IGNORE INTO groups_new (id, name, created_at)
            SELECT id, name, created_at FROM groups;
        `);
      }

      database.exec("DROP TABLE groups");
      database.exec("ALTER TABLE groups_new RENAME TO groups");
    } else if (hasGroupsNew) {
      database.exec("DROP TABLE IF EXISTS groups_new");
    }

    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  } finally {
    database.pragma("foreign_keys = ON");
  }
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      avatar TEXT NOT NULL,
      xp INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      last_completion_date TEXT,
      leaderboard_private INTEGER DEFAULT 0,
      group_id TEXT NOT NULL,
      is_owner INTEGER DEFAULT 0,
      tutorial_seen INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (group_id) REFERENCES groups(id)
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      due_date TEXT NOT NULL,
      xp_reward INTEGER NOT NULL DEFAULT 10,
      created_by TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS completions (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      xp_earned INTEGER,
      completed_at TEXT DEFAULT (datetime('now')),
      UNIQUE(assignment_id, user_id),
      FOREIGN KEY (assignment_id) REFERENCES assignments(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  migrateSchema(database);
  migrateAssignments(database);
  migrateCompletions(database);
}

function migrateCompletions(database: Database.Database) {
  if (!tableExists(database, "completions")) return;

  const cols = database.pragma("table_info(completions)") as { name: string }[];
  if (!cols.some((c) => c.name === "xp_earned")) {
    database.exec("ALTER TABLE completions ADD COLUMN xp_earned INTEGER");
  }
}

function migrateAssignments(database: Database.Database) {
  if (!tableExists(database, "assignments")) return;

  const cols = database.pragma("table_info(assignments)") as { name: string }[];
  if (!cols.some((c) => c.name === "xp_reward")) {
    database.exec(
      "ALTER TABLE assignments ADD COLUMN xp_reward INTEGER NOT NULL DEFAULT 10"
    );
  }
}

export function getDb(): Database.Database {
  if (db) return db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const database = new Database(DB_PATH);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  initSchema(database);
  db = database;
  return db;
}
