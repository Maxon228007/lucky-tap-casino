"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = initDb;
exports.saveDb = saveDb;
exports.getDb = getDb;
exports.closeDb = closeDb;
exports.queryOne = queryOne;
exports.queryAll = queryAll;
exports.runQuery = runQuery;
const sql_js_1 = __importDefault(require("sql.js"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DB_PATH = path_1.default.join(__dirname, '..', '..', 'data', 'lucky_tap.db');
let db = null;
async function initDb() {
    if (db)
        return db;
    const dir = path_1.default.dirname(DB_PATH);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    const SQL = await (0, sql_js_1.default)();
    if (fs_1.default.existsSync(DB_PATH)) {
        const buffer = fs_1.default.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
    }
    else {
        db = new SQL.Database();
    }
    db.run('PRAGMA journal_mode = WAL');
    db.run('PRAGMA foreign_keys = ON');
    initSchema(db);
    saveDb();
    return db;
}
function initSchema(database) {
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
function saveDb() {
    if (!db)
        return;
    const data = db.export();
    const buffer = Buffer.from(data);
    fs_1.default.writeFileSync(DB_PATH, buffer);
}
function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call initDb() first.');
    }
    return db;
}
function closeDb() {
    if (db) {
        saveDb();
        db.close();
        db = null;
    }
}
function queryOne(sql, params = []) {
    const database = getDb();
    const stmt = database.prepare(sql);
    stmt.bind(params);
    const result = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    return result;
}
function queryAll(sql, params = []) {
    const database = getDb();
    const stmt = database.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
}
function runQuery(sql, params = []) {
    const database = getDb();
    database.run(sql, params);
    saveDb();
    const stmt = database.prepare('SELECT last_insert_rowid() as id, changes() as changes');
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    return { changes: result.changes, lastInsertRowid: result.id };
}
