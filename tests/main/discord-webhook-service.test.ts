import { describe, expect, it, vi } from 'vitest';
import { openDatabase } from '../../electron/main/db/database';
import { DiscordWebhookService } from '../../electron/main/services/discord-webhook-service';
import { LogService } from '../../electron/main/services/log-service';
import { QueueRepository } from '../../electron/main/services/queue-repository';
import { SettingsService } from '../../electron/main/services/settings-service';

describe('DiscordWebhookService', () => {
  it('keeps jobs pending until the Twitch VOD URL is available, then posts', async () => {
    const db = openDatabase();
    const queues = new QueueRepository(db);
    const settings = new SettingsService(db);
    settings.update({ discord: { webhookUrl: 'https://discord.example/webhook' } });
    const item = queues.markAudioReady(
      queues.enqueuePending({ text: 'question', username: 'viewer' }).id,
      '/tmp/audio.mp3',
    );
    const played = queues.updateStatus(item.id, 'playing', {
      playedAt: '2026-05-17T00:00:00.000Z',
      vodOffsetMs: 90_000,
    })!;
    const finished = queues.updateStatus(played.id, 'finished', {
      finishedAt: '2026-05-17T00:01:00.000Z',
    })!;
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    const resolveVod = vi
      .fn(async () => null as string | null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('https://www.twitch.tv/videos/1?t=1m30s');
    const service = new DiscordWebhookService(
      db,
      queues,
      settings,
      new LogService(db),
      resolveVod,
      fetchMock as typeof fetch,
    );

    service.createPendingJob(finished);
    await service.processPendingJobs();
    expect(fetchMock).not.toHaveBeenCalled();

    db.prepare('UPDATE discord_webhook_jobs SET next_attempt_at = ?').run('2000-01-01T00:00:00.000Z');
    await service.processPendingJobs();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(db.prepare('SELECT status FROM discord_webhook_jobs').get()).toEqual({ status: 'posted' });
  });
});
