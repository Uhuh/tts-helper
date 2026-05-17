import type Database from 'better-sqlite3';
import { DEFAULT_QUEUE_ID, DEFAULT_SETTINGS } from '../../../src/shared/types';

export interface Migration {
  id: string;
  up(db: Database.Database): void;
}

const nowSql = "strftime('%Y-%m-%dT%H:%M:%fZ','now')";

export const migrations: Migration[] = [
  {
    id: '202605170001_initial_local_queue_schema',
    up(db) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS migrations (
          id TEXT PRIMARY KEY,
          applied_at TEXT NOT NULL DEFAULT (${nowSql})
        );

        CREATE TABLE IF NOT EXISTS queues (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          priority INTEGER NOT NULL DEFAULT 0,
          sort_mode TEXT NOT NULL DEFAULT 'fifo' CHECK (sort_mode IN ('fifo', 'lifo', 'priority')),
          paused INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (${nowSql}),
          updated_at TEXT NOT NULL DEFAULT (${nowSql}),
          deleted_at TEXT
        );

        CREATE TABLE IF NOT EXISTS queue_items (
          id TEXT PRIMARY KEY,
          queue_id TEXT NOT NULL REFERENCES queues(id),
          action_type TEXT NOT NULL,
          action_id TEXT,
          source TEXT NOT NULL,
          username TEXT NOT NULL,
          text TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN (
            'pending_audio',
            'queued',
            'playing',
            'finished',
            'skipped',
            'stopped',
            'failed'
          )),
          priority INTEGER NOT NULL DEFAULT 0,
          requested_at TEXT NOT NULL DEFAULT (${nowSql}),
          audio_path TEXT,
          vod_offset_ms INTEGER,
          played_at TEXT,
          finished_at TEXT,
          failed_reason TEXT,
          deleted_at TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_queue_items_queue_status
          ON queue_items(queue_id, status, deleted_at);
        CREATE INDEX IF NOT EXISTS idx_queue_items_action
          ON queue_items(action_type, action_id, deleted_at);

        CREATE TABLE IF NOT EXISTS action_routes (
          id TEXT PRIMARY KEY,
          action_type TEXT NOT NULL,
          action_id TEXT,
          queue_id TEXT NOT NULL REFERENCES queues(id),
          enabled INTEGER NOT NULL DEFAULT 1,
          character_limit INTEGER NOT NULL DEFAULT 300,
          created_at TEXT NOT NULL DEFAULT (${nowSql}),
          updated_at TEXT NOT NULL DEFAULT (${nowSql}),
          deleted_at TEXT
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_action_routes_unique_active
          ON action_routes(action_type, COALESCE(action_id, ''))
          WHERE deleted_at IS NULL;

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value_json TEXT NOT NULL,
          updated_at TEXT NOT NULL DEFAULT (${nowSql})
        );

        CREATE TABLE IF NOT EXISTS stream_sessions (
          id TEXT PRIMARY KEY,
          twitch_channel_id TEXT,
          twitch_channel_name TEXT,
          started_at TEXT NOT NULL,
          ended_at TEXT,
          twitch_vod_id TEXT,
          vod_url TEXT,
          deleted_at TEXT
        );

        CREATE TABLE IF NOT EXISTS discord_webhook_jobs (
          id TEXT PRIMARY KEY,
          queue_item_id TEXT NOT NULL REFERENCES queue_items(id),
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'failed')),
          attempts INTEGER NOT NULL DEFAULT 0,
          next_attempt_at TEXT NOT NULL DEFAULT (${nowSql}),
          payload_json TEXT NOT NULL,
          response_error TEXT,
          created_at TEXT NOT NULL DEFAULT (${nowSql}),
          updated_at TEXT NOT NULL DEFAULT (${nowSql}),
          posted_at TEXT,
          deleted_at TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_discord_jobs_status
          ON discord_webhook_jobs(status, next_attempt_at, deleted_at);

        CREATE TABLE IF NOT EXISTS logs (
          id TEXT PRIMARY KEY,
          level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
          scope TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (${nowSql})
        );
      `);

      db.prepare(`
        INSERT OR IGNORE INTO queues (id, name, priority, sort_mode, paused)
        VALUES (?, 'Default', 0, 'fifo', 0)
      `).run(DEFAULT_QUEUE_ID);

      db.prepare(`
        INSERT OR IGNORE INTO settings (key, value_json)
        VALUES ('app', ?)
      `).run(JSON.stringify(DEFAULT_SETTINGS));
    },
  },
  {
    id: '202605170002_action_route_settings',
    up(db) {
      const columns = db.prepare('PRAGMA table_info(action_routes)').all() as { name: string }[];
      const names = new Set(columns.map((column) => column.name));

      if (!names.has('enabled')) {
        db.exec('ALTER TABLE action_routes ADD COLUMN enabled INTEGER NOT NULL DEFAULT 1;');
      }

      if (!names.has('character_limit')) {
        db.exec('ALTER TABLE action_routes ADD COLUMN character_limit INTEGER NOT NULL DEFAULT 300;');
      }
    },
  },
];

export function runMigrations(db: Database.Database): void {
  db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (${nowSql})
    );
  `);

  const applied = db
    .prepare('SELECT id FROM migrations')
    .all()
    .map((row) => (row as { id: string }).id);
  const appliedSet = new Set(applied);

  const tx = db.transaction(() => {
    for (const migration of migrations) {
      if (appliedSet.has(migration.id)) {
        continue;
      }

      migration.up(db);
      db.prepare('INSERT INTO migrations (id) VALUES (?)').run(migration.id);
    }
  });

  tx();
}
