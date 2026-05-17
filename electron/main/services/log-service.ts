import type Database from 'better-sqlite3';
import type { LogLevel, LogRecord } from '../../../src/shared/types';

export class LogService {
  constructor(private readonly db: Database.Database) {}

  add(level: LogLevel, scope: string, message: string): LogRecord {
    const record: LogRecord = {
      id: crypto.randomUUID(),
      level,
      scope,
      message,
      createdAt: new Date().toISOString(),
    };

    this.db.prepare(`
      INSERT INTO logs (id, level, scope, message, created_at)
      VALUES (@id, @level, @scope, @message, @createdAt)
    `).run(record);

    return record;
  }

  list(limit = 300): LogRecord[] {
    return this.db.prepare(`
      SELECT id, level, scope, message, created_at AS createdAt
      FROM logs
      ORDER BY created_at DESC
      LIMIT ?
    `).all(limit) as LogRecord[];
  }
}
