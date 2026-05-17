import { describe, expect, it, vi } from 'vitest';
import { openDatabase } from '../../electron/main/db/database';
import { LogService } from '../../electron/main/services/log-service';
import { QueueRepository } from '../../electron/main/services/queue-repository';
import { SettingsService } from '../../electron/main/services/settings-service';
import { parseTwitchDuration, TwitchService } from '../../electron/main/services/twitch-service';
import { TWITCH_CHAT_ACTION_TYPE, TWITCH_REDEEM_ACTION_TYPE, type QueueItemRecord } from '../../src/shared/types';

interface TestableTwitchService {
  handleChatMessage(channel: string, username: string, text: string, user: { displayName?: string }): Promise<void>;
  handleRedeem(rewardId: string, username: string, input: string): Promise<void>;
}

describe('TwitchService queue routing', () => {
  it('routes chat command TTS to the configured queue', async () => {
    const db = openDatabase();
    const queues = new QueueRepository(db);
    const vip = queues.createQueue({ name: 'VIP' });
    queues.updateQueue({
      id: vip.id,
      twitchRoutes: {
        chat: {
          enabled: true,
          actionId: '!vip',
          characterLimit: 120,
        },
      },
    });
    const enqueue = vi.fn(async () => ({}) as QueueItemRecord);
    const service = new TwitchService(
      db,
      queues,
      new SettingsService(db),
      new LogService(db),
      enqueue,
    ) as unknown as TestableTwitchService;

    await service.handleChatMessage('#streamer', 'viewer', '!vip please read this', { displayName: 'Viewer' });

    expect(enqueue).toHaveBeenCalledWith({
      text: 'please read this',
      username: 'Viewer',
      source: 'twitch-chat',
      queueId: vip.id,
      actionType: TWITCH_CHAT_ACTION_TYPE,
      actionId: '!vip',
      charLimit: 120,
    });
  });

  it('routes channel point TTS to the configured queue', async () => {
    const db = openDatabase();
    const queues = new QueueRepository(db);
    const vip = queues.createQueue({ name: 'VIP' });
    queues.updateQueue({
      id: vip.id,
      twitchRoutes: {
        redeem: {
          enabled: true,
          actionId: 'reward-vip',
          characterLimit: 220,
        },
      },
    });
    const enqueue = vi.fn(async () => ({}) as QueueItemRecord);
    const service = new TwitchService(
      db,
      queues,
      new SettingsService(db),
      new LogService(db),
      enqueue,
    ) as unknown as TestableTwitchService;

    await service.handleRedeem('reward-vip', 'Viewer', 'redeem this one');

    expect(enqueue).toHaveBeenCalledWith({
      text: 'redeem this one',
      username: 'Viewer',
      source: 'twitch-redeem',
      queueId: vip.id,
      actionType: TWITCH_REDEEM_ACTION_TYPE,
      actionId: 'reward-vip',
      charLimit: 220,
    });
  });
});

describe('TwitchService VOD URLs', () => {
  it('uses Twitch VOD start time instead of a stale OBS offset', async () => {
    const db = openDatabase();
    const queues = new QueueRepository(db);
    const settings = new SettingsService(db);
    settings.update({
      twitch: {
        token: 'token',
        clientId: 'client',
        channelId: '1234',
      },
    });
    const item = queues.markAudioReady(
      queues.enqueuePending({ text: 'question', username: 'viewer' }).id,
      '/tmp/audio.mp3',
    );
    const playing = queues.updateStatus(item.id, 'playing', {
      playedAt: '2026-05-17T14:08:06.222Z',
      vodOffsetMs: 35_027_331,
    })!;
    const fetchMock = vi.fn(async () => Response.json({
      data: [
        {
          id: '2774174395',
          url: 'https://www.twitch.tv/videos/2774174395',
          created_at: '2026-05-17T11:21:25Z',
          duration: '2h50m0s',
          type: 'archive',
        },
      ],
    }));
    const service = new TwitchService(
      db,
      queues,
      settings,
      new LogService(db),
      vi.fn(async () => ({}) as QueueItemRecord),
      fetchMock as typeof fetch,
    );

    await expect(service.findVodUrlForItem(playing)).resolves.toBe(
      'https://www.twitch.tv/videos/2774174395?t=2h46m41s',
    );
    expect(queues.getItem(item.id)?.vodOffsetMs).toBe(10_001_222);
  });

  it('waits when only older archive VODs are available', async () => {
    const db = openDatabase();
    const queues = new QueueRepository(db);
    const settings = new SettingsService(db);
    settings.update({
      twitch: {
        token: 'token',
        clientId: 'client',
        channelId: '1234',
      },
    });
    const item = queues.markAudioReady(
      queues.enqueuePending({ text: 'question', username: 'viewer' }).id,
      '/tmp/audio.mp3',
    );
    const playing = queues.updateStatus(item.id, 'playing', {
      playedAt: '2026-05-17T14:08:06.222Z',
      vodOffsetMs: 10_001_222,
    })!;
    const fetchMock = vi.fn(async () => Response.json({
      data: [
        {
          id: 'old-vod',
          url: 'https://www.twitch.tv/videos/old-vod',
          created_at: '2026-05-16T12:56:26Z',
          duration: '4h0m0s',
          type: 'archive',
        },
      ],
    }));
    const service = new TwitchService(
      db,
      queues,
      settings,
      new LogService(db),
      vi.fn(async () => ({}) as QueueItemRecord),
      fetchMock as typeof fetch,
    );

    await expect(service.findVodUrlForItem(playing)).resolves.toBeNull();
  });

  it('parses Twitch duration strings', () => {
    expect(parseTwitchDuration('2h46m41s')).toBe(10_001_000);
    expect(parseTwitchDuration('59m3s')).toBe(3_543_000);
    expect(parseTwitchDuration('42s')).toBe(42_000);
    expect(parseTwitchDuration(undefined)).toBeNull();
  });
});
