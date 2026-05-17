import { describe, expect, it, vi } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { openDatabase } from '../../electron/main/db/database';
import { AppService } from '../../electron/main/services/app-service';
import { DiscordWebhookService } from '../../electron/main/services/discord-webhook-service';
import { LocalApiServer } from '../../electron/main/services/local-api-server';
import { LogService } from '../../electron/main/services/log-service';
import { ObsService } from '../../electron/main/services/obs-service';
import { OverlayService } from '../../electron/main/services/overlay-service';
import { PlaybackService } from '../../electron/main/services/playback-service';
import { QueueRepository } from '../../electron/main/services/queue-repository';
import { SettingsService } from '../../electron/main/services/settings-service';
import { TwitchService } from '../../electron/main/services/twitch-service';

describe('LocalApiServer', () => {
  it('enqueues TTS through the local HTTP API and exposes playback actions', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tts-helper-api-'));
    const db = openDatabase();
    const queues = new QueueRepository(db);
    const settings = new SettingsService(db);
    const logs = new LogService(db);
    const overlay = new OverlayService();
    const discord = new DiscordWebhookService(db, queues, settings, logs, async () => null);
    const playback = new PlaybackService(
      queues,
      settings,
      new ObsService(logs),
      overlay,
      discord,
      logs,
      () => ({ webContents: { send: vi.fn() } }) as never,
      vi.fn(),
    );
    const tts = {
      generate: vi.fn(async (item: { id: string }) => {
        const audioPath = path.join(tempDir, `${item.id}.mp3`);
        await fs.writeFile(audioPath, 'mp3');
        return audioPath;
      }),
    };
    const app = new AppService(queues, settings, tts as never, playback, logs, () => null);
    const server = new LocalApiServer(app, playback, overlay, logs, 0);
    try {
      await app.updateSettings({
        obs: {
          browserSourceCaptionsEnabled: false,
          browserSourceAudioEnabled: true,
        },
      });

      const obs = await server.inject({
        method: 'GET',
        url: '/obs/captions',
      });
      expect(obs.statusCode).toBe(200);
      expect(obs.body).toContain('browserSourceCaptionsEnabled: false');
      expect(obs.body).toContain('browserSourceAudioEnabled: true');
      expect(obs.body).toContain('/api/obs/settings');
      expect(obs.body).toContain('/api/audio/');

      const obsSettings = await server.inject({
        method: 'GET',
        url: '/api/obs/settings',
      });
      expect(obsSettings.statusCode).toBe(200);
      expect(JSON.parse(obsSettings.body) as unknown).toEqual({
        browserSourceCaptionsEnabled: false,
        browserSourceAudioEnabled: true,
      });

      const response = await server.inject({
        method: 'POST',
        url: '/api/tts',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify({ text: 'hello', username: 'api-user' }),
      });

      expect(response.statusCode).toBe(200);
      const item = JSON.parse(response.body) as { id: string };
      expect(item).toMatchObject({
        username: 'api-user',
        status: 'queued',
      });

      const audio = await server.inject({
        method: 'GET',
        url: `/api/audio/${item.id}`,
      });
      expect(audio.statusCode).toBe(200);
      expect(audio.headers['content-type']).toContain('audio/mpeg');
      expect(audio.body).toBe('mp3');

      const play = await server.inject({
        method: 'POST',
        url: '/api/playback/play-next',
      });
      expect(play.statusCode).toBe(200);
    } finally {
      await server.stop();
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  it('authorizes Twitch through the device code flow', async () => {
    vi.useFakeTimers();
    const db = openDatabase();
    const queues = new QueueRepository(db);
    const settings = new SettingsService(db);
    const logs = new LogService(db);
    const overlay = new OverlayService();
    const discord = new DiscordWebhookService(db, queues, settings, logs, async () => null);
    const playback = new PlaybackService(
      queues,
      settings,
      new ObsService(logs),
      overlay,
      discord,
      logs,
      () => ({ webContents: { send: vi.fn() } }) as never,
      vi.fn(),
    );
    const tts = {
      generate: vi.fn(async (item: { id: string }) => `/tmp/${item.id}.mp3`),
    };
    const app = new AppService(queues, settings, tts as never, playback, logs, () => null);
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      const href = String(url);
      if (href.includes('/oauth2/device')) {
        return Response.json({
          device_code: 'device-code',
          user_code: 'ABCDEFGH',
          verification_uri: 'https://www.twitch.tv/activate?public=true&device-code=ABCDEFGH',
          expires_in: 1800,
          interval: 1,
        });
      }

      if (href.includes('/oauth2/token')) {
        return Response.json({
          access_token: 'token',
          refresh_token: 'refresh',
          expires_in: 3600,
          scope: ['chat:read', 'channel:read:redemptions'],
          token_type: 'bearer',
        });
      }

      return Response.json({
        client_id: 'client',
        login: 'streamer',
        scopes: ['chat:read', 'channel:read:redemptions'],
        user_id: '1234',
        expires_in: 3600,
      });
    });
    const openExternal = vi.fn();
    const onAuthorizationChanged = vi.fn();
    const twitch = new TwitchService(
      db,
      queues,
      settings,
      logs,
      (input) => app.enqueue(input),
      fetchMock as typeof fetch,
      openExternal,
      onAuthorizationChanged,
    );
    vi.spyOn(twitch, 'syncFromSettings').mockResolvedValue(undefined);
    app.attachTwitch(twitch);

    try {
      const oauth = await app.startTwitchOAuth({ clientId: 'client' });
      expect(oauth).toMatchObject({
        authorizationUrl: 'https://www.twitch.tv/activate?public=true&device-code=ABCDEFGH',
        redirectUri: null,
        userCode: 'ABCDEFGH',
      });
      expect(openExternal).toHaveBeenCalledWith(oauth.authorizationUrl);

      await vi.advanceTimersByTimeAsync(1000);

      expect(settings.get().twitch).toMatchObject({
        enabled: true,
        token: 'token',
        refreshToken: 'refresh',
        channelId: '1234',
        channelName: 'streamer',
      });
      expect(settings.get().twitch.tokenExpiresAt).toEqual(expect.any(String));
      expect(onAuthorizationChanged).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
