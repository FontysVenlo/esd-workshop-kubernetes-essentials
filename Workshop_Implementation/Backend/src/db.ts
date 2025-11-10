import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DB_FILE = process.env.DB_FILE || "app.db";

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const dbPath = path.join(DATA_DIR, DB_FILE);
export const db = new Database(dbPath);

// init schema
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

export type Item = { id: number; name: string; created_at: string };

export function listItems() {
  return db.prepare("SELECT id, name, created_at FROM items ORDER BY id DESC").all();
}

export function addItem(name: string): number {
  const stmt = db.prepare("INSERT INTO items (name) VALUES (?)");
  const info = stmt.run(name);
  return Number(info.lastInsertRowid);
}

export function deleteItem(id: number): void {
  db.prepare("DELETE FROM items WHERE id = ?").run(id);
}
