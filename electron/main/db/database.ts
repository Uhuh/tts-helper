import BetterSqlite3 from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { runMigrations } from './migrations';

export function openAppDatabase(dataDirectory: string): BetterSqlite3.Database {
  fs.mkdirSync(dataDirectory, { recursive: true });
  const dbPath = path.join(dataDirectory, 'tts-helper.sqlite3');
  return openDatabase(dbPath);
}

export function openDatabase(filename = ':memory:'): BetterSqlite3.Database {
  const db = new BetterSqlite3(filename);
  runMigrations(db);
  return db;
}
