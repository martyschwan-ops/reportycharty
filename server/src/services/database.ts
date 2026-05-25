import { Database as SqliteDb } from 'node-sqlite3-wasm';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(__dirname, '../../../data');
const DB_PATH = path.join(DATA_DIR, 'reportycharty.db');

// Thin wrapper so routes can call .run(a, b, c) / .get(a) / .all() with
// spread params, matching the better-sqlite3 API that node-sqlite3-wasm
// replaced (node-sqlite3-wasm expects an array of bindings instead).
function wrapStmt(rawDb: SqliteDb, sql: string) {
  return {
    run(...args: any[]) {
      const stmt = rawDb.prepare(sql);
      const result = stmt.run(args);
      stmt.finalize();
      return result;
    },
    get(...args: any[]) {
      const stmt = rawDb.prepare(sql);
      const result = stmt.get(args.length ? args : []);
      stmt.finalize();
      return result;
    },
    all(...args: any[]) {
      const stmt = rawDb.prepare(sql);
      const result = stmt.all(args.length ? args : []);
      stmt.finalize();
      return result;
    },
  };
}

class Db {
  private _db: SqliteDb;

  constructor(dbPath: string) {
    this._db = new SqliteDb(dbPath);
  }

  exec(sql: string) { this._db.exec(sql); }
  pragma(pragma: string) { this._db.exec(`PRAGMA ${pragma}`); }
  prepare(sql: string) { return wrapStmt(this._db, sql); }
}

let db: Db;

export function initDb(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  db = new Db(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS datasources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      size INTEGER NOT NULL,
      uploaded_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      sheets TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS chart_configs (
      id TEXT PRIMARY KEY,
      datasource_id TEXT NOT NULL,
      name TEXT NOT NULL,
      config TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (datasource_id) REFERENCES datasources(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recent_views (
      id TEXT PRIMARY KEY,
      datasource_id TEXT NOT NULL,
      viewed_at TEXT NOT NULL,
      FOREIGN KEY (datasource_id) REFERENCES datasources(id) ON DELETE CASCADE
    );
  `);
}

export function getDb(): Db {
  return db;
}
