import type Database from 'better-sqlite3';
import type { QueueItemRecord } from '../../../src/shared/types';
import type { LogService } from './log-service';
import type { QueueRepository } from './queue-repository';
import type { SettingsService } from './settings-service';

export type VodUrlResolver = (item: QueueItemRecord) => Promise<string | null>;

interface DiscordJobRow {
  id: string;
  queueItemId: string;
  attempts: number;
  payloadJson: string;
}

export class DiscordWebhookService {
  constructor(
    private readonly db: Database.Database,
    private readonly queueRepository: QueueRepository,
    private readonly settings: SettingsService,
    private readonly logs: LogService,
    private readonly resolveVodUrl: VodUrlResolver,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  createPendingJob(item: QueueItemRecord): void {
    const webhookUrl = this.settings.get().discord.webhookUrl.trim();
    if (!webhookUrl) {
      return;
    }

    const payload = {
      queueItemId: item.id,
      username: item.username,
      text: item.text,
      askedAt: item.requestedAt,
      playedAt: item.playedAt,
      vodOffsetMs: item.vodOffsetMs,
    };

    this.db.prepare(`
      INSERT INTO discord_webhook_jobs (
        id,
        queue_item_id,
        payload_json
      ) VALUES (?, ?, ?)
    `).run(crypto.randomUUID(), item.id, JSON.stringify(payload));
  }

  async processPendingJobs(limit = 20): Promise<void> {
    const jobs = this.db.prepare(`
      SELECT
        id,
        queue_item_id AS queueItemId,
        attempts,
        payload_json AS payloadJson
      FROM discord_webhook_jobs
      WHERE status = 'pending'
        AND deleted_at IS NULL
        AND next_attempt_at <= ?
      ORDER BY created_at ASC
      LIMIT ?
    `).all(new Date().toISOString(), limit) as DiscordJobRow[];

    for (const job of jobs) {
      await this.processJob(job);
    }
  }

  private async processJob(job: DiscordJobRow): Promise<void> {
    const item = this.queueRepository.getItem(job.queueItemId, true);
    const webhookUrl = this.settings.get().discord.webhookUrl.trim();

    if (!item || !webhookUrl) {
      this.failOrRetry(job, 'Missing queue item or Discord webhook URL.');
      return;
    }

    const vodUrl = await this.resolveVodUrl(item);
    if (!vodUrl) {
      this.failOrRetry(job, 'Twitch VOD is not available yet.');
      return;
    }

    const payload = this.buildDiscordPayload(item, vodUrl);

    try {
      const response = await this.fetchImpl(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Discord webhook returned ${response.status}.`);
      }

      this.db.prepare(`
        UPDATE discord_webhook_jobs
        SET status = 'posted',
            attempts = attempts + 1,
            posted_at = ?,
            updated_at = ?
        WHERE id = ?
      `).run(new Date().toISOString(), new Date().toISOString(), job.id);

      this.logs.add('info', 'DiscordWebhookService.processJob', `Posted Discord webhook for item ${item.id}.`);
    } catch (error) {
      this.failOrRetry(job, error instanceof Error ? error.message : JSON.stringify(error));
    }
  }

  private failOrRetry(job: DiscordJobRow, reason: string): void {
    const attempts = job.attempts + 1;
    const status = attempts >= 30 ? 'failed' : 'pending';
    const nextAttempt = new Date(Date.now() + Math.min(15 * 60_000, attempts * 30_000)).toISOString();

    this.db.prepare(`
      UPDATE discord_webhook_jobs
      SET status = ?,
          attempts = ?,
          next_attempt_at = ?,
          response_error = ?,
          updated_at = ?
      WHERE id = ?
    `).run(status, attempts, nextAttempt, reason, new Date().toISOString(), job.id);

    this.logs.add(status === 'failed' ? 'error' : 'info', 'DiscordWebhookService.failOrRetry', reason);
  }

  private buildDiscordPayload(item: QueueItemRecord, vodUrl: string): unknown {
    return {
      content: `TTS from ${item.username}: ${vodUrl}`,
      embeds: [
        {
          title: 'TTS played on stream',
          color: 0x7c3aed,
          fields: [
            {
              name: 'Question',
              value: item.text.slice(0, 1024) || 'No text',
            },
            {
              name: 'Asked by',
              value: item.username,
              inline: true,
            },
            {
              name: 'Asked at',
              value: item.requestedAt,
              inline: true,
            },
            {
              name: 'VOD timestamp',
              value: vodUrl,
            },
          ],
        },
      ],
    };
  }
}

export function twitchTimestamp(offsetMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(offsetMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    hours ? `${hours}h` : '',
    minutes ? `${minutes}m` : '',
    `${seconds}s`,
  ].join('');
}
