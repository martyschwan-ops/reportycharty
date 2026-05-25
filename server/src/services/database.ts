import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(__dirname, '../../../data');
const DB_PATH = path.join(DATA_DIR, 'reportycharty.db');

let db: Database.Database;

export function initDb(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  db = new Database(DB_PATH);
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

export function getDb(): Database.Database {
  return db;
}
