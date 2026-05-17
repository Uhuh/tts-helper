import type Database from 'better-sqlite3';
import {
  DEFAULT_SETTINGS,
  type AppSettings,
  type PartialDeep,
} from '../../../src/shared/types';

function mergeDeep<T extends Record<string, unknown>>(base: T, patch: PartialDeep<T>): T {
  const result = { ...base };

  for (const [key, value] of Object.entries(patch) as [keyof T, unknown][]) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      base[key] &&
      typeof base[key] === 'object' &&
      !Array.isArray(base[key])
    ) {
      result[key] = mergeDeep(base[key] as Record<string, unknown>, value as Record<string, unknown>) as T[keyof T];
    } else if (value !== undefined) {
      result[key] = value as T[keyof T];
    }
  }

  return result;
}

export class SettingsService {
  constructor(private readonly db: Database.Database) {}

  get(): AppSettings {
    const row = this.db
      .prepare('SELECT value_json AS valueJson FROM settings WHERE key = ?')
      .get('app') as { valueJson: string } | undefined;

    if (!row) {
      return DEFAULT_SETTINGS;
    }

    return mergeDeep(DEFAULT_SETTINGS as unknown as Record<string, unknown>, JSON.parse(row.valueJson)) as unknown as AppSettings;
  }

  update(patch: PartialDeep<AppSettings>): AppSettings {
    const next = mergeDeep(this.get() as unknown as Record<string, unknown>, patch as unknown as Record<string, unknown>) as unknown as AppSettings;

    this.db.prepare(`
      INSERT INTO settings (key, value_json, updated_at)
      VALUES ('app', ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value_json = excluded.value_json,
        updated_at = excluded.updated_at
    `).run(JSON.stringify(next), new Date().toISOString());

    return next;
  }
}
