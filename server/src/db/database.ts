import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SqlJsDatabase = any;

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'lucky_tap.db');

let db: SqlJsDatabase | null = null;

export async function initDb(): Promise<SqlJsDatabase> {
  if (db) return db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA journal_mode = WAL');
  db.run('PRAGMA foreign_keys = ON');

  initSchema(db);
  saveDb();

  return db;
}

function initSchema(database: SqlJsDatabase): void {
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id TEXT UNIQUE NOT NULL,
      username TEXT DEFAULT '',
      first_name TEXT DEFAULT '',
      balance INTEGER DEFAULT 500,
      spins_remaining INTEGER DEFAULT 3,
      last_spin_reset TEXT DEFAULT (datetime('now')),
      total_earned INTEGER DEFAULT 0,
      total_wagered INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS spin_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      reward INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS slots_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      bet INTEGER NOT NULL,
      result TEXT NOT NULL,
      win_amount INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
}

export function saveDb(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

export function getDb(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    saveDb();
    db.close();
    db = null;
  }
}

export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const database = getDb();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const result: T | null = stmt.step() ? (stmt.getAsObject() as T) : null;
  stmt.free();
  return result;
}

export function queryAll<T = any>(sql: string, params: any[] = []): T[] {
  const database = getDb();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

export function runQuery(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number } {
  const database = getDb();
  database.run(sql, params);
  saveDb();
  const stmt = database.prepare('SELECT last_insert_rowid() as id, changes() as changes');
  stmt.step();
  const result = stmt.getAsObject() as any;
  stmt.free();
  return { changes: result.changes, lastInsertRowid: result.id };
}
