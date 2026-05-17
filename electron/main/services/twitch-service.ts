import { ApiClient } from '@twurple/api';
import { StaticAuthProvider } from '@twurple/auth';
import { ChatClient, type ChatUser } from '@twurple/chat';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import type Database from 'better-sqlite3';
import { TWITCH_CHAT_ACTION_TYPE, TWITCH_OAUTH_SCOPES, TWITCH_REDEEM_ACTION_TYPE, type EnqueueRequest, type QueueItemRecord, type TwitchOAuthCompleteInput, type TwitchOAuthStartInput, type TwitchOAuthStartResult, type TwitchSettings } from '../../../src/shared/types';
import { twitchTimestamp } from './discord-webhook-service';
import type { LogService } from './log-service';
import type { QueueRepository } from './queue-repository';
import type { SettingsService } from './settings-service';

interface TwitchValidateResponse {
  client_id: string;
  login: string;
  scopes: string[];
  user_id: string;
  expires_in: number;
}

interface TwitchVideoResponse {
  data: {
    id: string;
    url: string;
    created_at: string;
    duration?: string;
    type: string;
  }[];
}

type TwitchVideo = TwitchVideoResponse['data'][number];

interface TwitchDeviceResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface TwitchDeviceTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string[];
  token_type: string;
}

interface TwitchOAuthErrorResponse {
  error?: string;
  message?: string;
  status?: number;
}

type OpenExternal = (url: string) => Promise<unknown> | unknown;
type AuthorizationChanged = () => Promise<unknown> | unknown;

export class TwitchService {
  private chatClient: ChatClient | null = null;
  private eventSub: EventSubWsListener | null = null;
  private apiClient: ApiClient | null = null;
  private activeToken = '';
  private pendingOAuth: {
    clientId: string;
    state: string;
    startedAt: number;
  } | null = null;
  private pendingDeviceOAuth: {
    clientId: string;
    deviceCode: string;
    expiresAt: number;
    intervalMs: number;
    timer: NodeJS.Timeout | null;
    pollInProgress: boolean;
  } | null = null;

  constructor(
    private readonly db: Database.Database,
    private readonly queues: QueueRepository,
    private readonly settings: SettingsService,
    private readonly logs: LogService,
    private readonly enqueue: (input: EnqueueRequest) => Promise<QueueItemRecord>,
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly openExternal: OpenExternal = () => undefined,
    private readonly onAuthorizationChanged: AuthorizationChanged = () => undefined,
    private readonly oauthRedirectUri = 'http://127.0.0.1:12589/twitch/oauth/callback',
  ) {}

  async syncFromSettings(): Promise<void> {
    const settings = this.settings.get().twitch;

    if (!settings.enabled || !settings.token.trim()) {
      await this.disconnect();
      return;
    }

    if (this.activeToken === settings.token && this.chatClient && this.eventSub) {
      return;
    }

    await this.connect(settings);
  }

  async disconnect(): Promise<void> {
    this.eventSub?.stop();
    this.eventSub = null;
    try {
      this.chatClient?.quit();
    } catch {
      undefined;
    }
    this.chatClient = null;
    this.apiClient = null;
    this.activeToken = '';
  }

  async connect(settings: TwitchSettings): Promise<void> {
    await this.disconnect();

    try {
      const user = await this.validate(settings.token);
      const nextSettings = this.settings.update({
        twitch: {
          channelId: user.user_id,
          channelName: user.login,
        },
      }).twitch;

      const authProvider = new StaticAuthProvider(nextSettings.clientId, nextSettings.token);
      this.apiClient = new ApiClient({ authProvider });
      this.chatClient = new ChatClient({
        authProvider,
        channels: [user.login],
      });

      await this.chatClient.connect();
      this.chatClient.onMessage((channel, username, text, message) => {
        void this.handleChatMessage(channel, username, text, message.userInfo).catch((error) => {
          this.logs.add('error', 'TwitchService.handleChatMessage', this.formatError(error));
        });
      });

      this.eventSub = new EventSubWsListener({ apiClient: this.apiClient });
      this.eventSub.start();
      this.eventSub.onChannelRedemptionAdd(user.user_id, (redeem) => {
        void this.handleRedeem(String(redeem.rewardId), redeem.userDisplayName, redeem.input).catch((error) => {
          this.logs.add('error', 'TwitchService.handleRedeem', this.formatError(error));
        });
      });
      this.eventSub.onStreamOnline(user.user_id, () => this.logStreamStart(user));
      this.eventSub.onStreamOffline(user.user_id, () => this.logStreamEnd());

      this.activeToken = settings.token;
      this.logs.add('info', 'TwitchService.connect', `Connected Twitch channel ${user.login}.`);
    } catch (error) {
      this.logs.add('error', 'TwitchService.connect', this.formatError(error));
      await this.disconnect();
    }
  }

  async startOAuth(input: TwitchOAuthStartInput = {}): Promise<TwitchOAuthStartResult> {
    const clientId = (input.clientId ?? this.settings.get().twitch.clientId).trim();
    if (!clientId) {
      throw new Error('Twitch Client ID is required before starting OAuth.');
    }

    this.settings.update({ twitch: { clientId } });
    this.stopDevicePolling();

    const body = new URLSearchParams({
      client_id: clientId,
      scopes: TWITCH_OAUTH_SCOPES.join(' '),
    });
    const response = await this.fetchImpl('https://id.twitch.tv/oauth2/device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      throw new Error(`Twitch device authorization returned ${response.status}.`);
    }

    const device = (await response.json()) as TwitchDeviceResponse;
    const expiresAt = Date.now() + device.expires_in * 1000;
    this.pendingDeviceOAuth = {
      clientId,
      deviceCode: device.device_code,
      expiresAt,
      intervalMs: Math.max(device.interval, 1) * 1000,
      timer: null,
      pollInProgress: false,
    };

    await this.openExternal(device.verification_uri);
    this.scheduleDevicePoll(this.pendingDeviceOAuth.intervalMs);
    this.logs.add('info', 'TwitchService.startOAuth', `Opened Twitch device authorization for code ${device.user_code}.`);

    return {
      authorizationUrl: device.verification_uri,
      redirectUri: null,
      userCode: device.user_code,
      expiresAt: new Date(expiresAt).toISOString(),
      intervalSeconds: Math.max(device.interval, 1),
      scopes: TWITCH_OAUTH_SCOPES,
    };
  }

  async completeOAuth(input: TwitchOAuthCompleteInput): Promise<TwitchSettings> {
    if (input.error) {
      throw new Error(input.errorDescription || input.error);
    }

    if (!input.accessToken) {
      throw new Error('Twitch OAuth did not return an access token.');
    }

    const pending = this.pendingOAuth;
    if (!pending || pending.state !== input.state || Date.now() - pending.startedAt > 10 * 60_000) {
      throw new Error('Twitch OAuth state is invalid or expired.');
    }

    this.pendingOAuth = null;
    return this.authorizeToken(pending.clientId, input.accessToken, input.expiresIn);
  }

  async clearAuthorization(): Promise<TwitchSettings> {
    this.pendingOAuth = null;
    this.stopDevicePolling();
    await this.disconnect();
    return this.settings.update({
      twitch: {
        enabled: false,
        token: '',
        refreshToken: '',
        tokenExpiresAt: null,
        channelId: '',
        channelName: '',
      },
    }).twitch;
  }

  async findVodUrlForItem(item: QueueItemRecord): Promise<string | null> {
    const twitch = this.settings.get().twitch;
    if (!twitch.token || !twitch.clientId || !twitch.channelId || item.vodOffsetMs === null) {
      return null;
    }

    const response = await this.fetchImpl(
      `https://api.twitch.tv/helix/videos?user_id=${encodeURIComponent(twitch.channelId)}&type=archive&first=5`,
      {
        headers: {
          Authorization: `Bearer ${twitch.token}`,
          'Client-Id': twitch.clientId,
        },
      },
    );

    if (!response.ok) {
      this.logs.add('warn', 'TwitchService.findVodUrlForItem', `Twitch videos returned ${response.status}.`);
      return null;
    }

    const videos = (await response.json()) as TwitchVideoResponse;
    const vodMatch = videos.data
      .filter((video) => video.type === 'archive')
      .map((video) => ({
        video,
        offsetMs: this.getVodOffsetMs(item, video),
      }))
      .filter((match): match is { video: TwitchVideo; offsetMs: number } => match.offsetMs !== null)
      .sort((a, b) => new Date(b.video.created_at).getTime() - new Date(a.video.created_at).getTime())
      .at(0);

    if (!vodMatch) {
      return null;
    }

    const { video: vod, offsetMs } = vodMatch;
    this.persistCorrectedVodOffset(item, offsetMs);

    const url = `${vod.url}?t=${twitchTimestamp(offsetMs)}`;
    this.db.prepare(`
      UPDATE stream_sessions
      SET twitch_vod_id = COALESCE(twitch_vod_id, ?),
          vod_url = COALESCE(vod_url, ?)
      WHERE deleted_at IS NULL
        AND ended_at IS NULL
    `).run(vod.id, vod.url);

    return url;
  }

  private getVodOffsetMs(item: QueueItemRecord, video: TwitchVideo): number | null {
    const playedAt = item.playedAt ? new Date(item.playedAt).getTime() : Number.NaN;
    const vodStartedAt = new Date(video.created_at).getTime();

    if (!Number.isFinite(playedAt) || !Number.isFinite(vodStartedAt) || playedAt < vodStartedAt) {
      return null;
    }

    const offsetMs = playedAt - vodStartedAt;
    const durationMs = parseTwitchDuration(video.duration);

    if (durationMs !== null && offsetMs > durationMs + 15 * 60_000) {
      return null;
    }

    if (durationMs === null && offsetMs > 18 * 60 * 60_000) {
      return null;
    }

    return offsetMs;
  }

  private persistCorrectedVodOffset(item: QueueItemRecord, offsetMs: number): void {
    if (item.vodOffsetMs !== null && Math.abs(item.vodOffsetMs - offsetMs) > 60_000) {
      this.logs.add(
        'warn',
        'TwitchService.findVodUrlForItem',
        `Corrected VOD offset for item ${item.id} from ${twitchTimestamp(item.vodOffsetMs)} to ${twitchTimestamp(offsetMs)} using Twitch VOD start time.`,
      );
    }

    if (item.vodOffsetMs !== offsetMs) {
      this.db.prepare(`
        UPDATE queue_items
        SET vod_offset_ms = ?
        WHERE id = ?
      `).run(offsetMs, item.id);
    }
  }

  private async validate(token: string): Promise<TwitchValidateResponse> {
    const response = await this.fetchImpl('https://id.twitch.tv/oauth2/validate', {
      headers: {
        Authorization: `OAuth ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Twitch token validation returned ${response.status}.`);
    }

    return response.json() as Promise<TwitchValidateResponse>;
  }

  private scheduleDevicePoll(delayMs: number): void {
    if (!this.pendingDeviceOAuth) {
      return;
    }

    this.pendingDeviceOAuth.timer = setTimeout(() => {
      void this.pollDeviceOAuth();
    }, delayMs);
    this.pendingDeviceOAuth.timer.unref?.();
  }

  private stopDevicePolling(): void {
    if (this.pendingDeviceOAuth?.timer) {
      clearTimeout(this.pendingDeviceOAuth.timer);
    }
    this.pendingDeviceOAuth = null;
  }

  private async pollDeviceOAuth(): Promise<void> {
    const pending = this.pendingDeviceOAuth;
    if (!pending || pending.pollInProgress) {
      return;
    }

    if (Date.now() >= pending.expiresAt) {
      this.logs.add('warn', 'TwitchService.pollDeviceOAuth', 'Twitch device authorization expired.');
      this.stopDevicePolling();
      await this.onAuthorizationChanged();
      return;
    }

    pending.pollInProgress = true;
    try {
      const response = await this.fetchImpl('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: pending.clientId,
          scopes: TWITCH_OAUTH_SCOPES.join(' '),
          device_code: pending.deviceCode,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        }),
      });

      if (response.ok) {
        const token = (await response.json()) as TwitchDeviceTokenResponse;
        this.stopDevicePolling();
        await this.authorizeToken(pending.clientId, token.access_token, token.expires_in, token.refresh_token);
        await this.onAuthorizationChanged();
        return;
      }

      const error = await this.readOAuthError(response);
      const code = error.error ?? error.message ?? `HTTP ${response.status}`;
      if (code === 'authorization_pending') {
        pending.pollInProgress = false;
        this.scheduleDevicePoll(pending.intervalMs);
        return;
      }

      if (code === 'slow_down') {
        pending.intervalMs += 5000;
        pending.pollInProgress = false;
        this.scheduleDevicePoll(pending.intervalMs);
        return;
      }

      this.logs.add('error', 'TwitchService.pollDeviceOAuth', `Twitch device authorization failed: ${code}.`);
      this.stopDevicePolling();
      await this.onAuthorizationChanged();
    } catch (error) {
      this.logs.add('error', 'TwitchService.pollDeviceOAuth', this.formatError(error));
      if (this.pendingDeviceOAuth) {
        this.pendingDeviceOAuth.pollInProgress = false;
        this.scheduleDevicePoll(this.pendingDeviceOAuth.intervalMs);
      }
    }
  }

  private async authorizeToken(
    clientId: string,
    accessToken: string,
    expiresIn?: number,
    refreshToken?: string,
  ): Promise<TwitchSettings> {
    const user = await this.validate(accessToken);
    if (user.client_id !== clientId) {
      throw new Error('Twitch OAuth token was issued for a different Client ID.');
    }

    const tokenExpiresAt = new Date(Date.now() + (expiresIn ?? user.expires_in) * 1000).toISOString();
    const next = this.settings.update({
      twitch: {
        enabled: true,
        clientId,
        token: accessToken,
        refreshToken: refreshToken ?? '',
        tokenExpiresAt,
        channelId: user.user_id,
        channelName: user.login,
      },
    }).twitch;

    this.logs.add('info', 'TwitchService.authorizeToken', `Authorized Twitch channel ${user.login}.`);
    return next;
  }

  private async readOAuthError(response: Response): Promise<TwitchOAuthErrorResponse> {
    try {
      return (await response.json()) as TwitchOAuthErrorResponse;
    } catch {
      return { error: await response.text() };
    }
  }

  private async handleChatMessage(_channel: string, username: string, text: string, user: ChatUser): Promise<void> {
    const command = text.trimStart().split(/\s+/, 1)[0] ?? '';
    const route = this.queues.findEnabledTwitchRoute(TWITCH_CHAT_ACTION_TYPE, command);

    if (!route) {
      return;
    }

    const trimmed = text.trimStart().substring(command.length).trim();
    if (!trimmed) {
      return;
    }

    await this.enqueue({
      text: trimmed,
      username: user.displayName || username,
      source: 'twitch-chat',
      queueId: route.queueId,
      actionType: TWITCH_CHAT_ACTION_TYPE,
      actionId: route.actionId,
      charLimit: route.characterLimit,
    });
  }

  private async handleRedeem(rewardId: string, username: string, input: string): Promise<void> {
    const route = this.queues.findEnabledTwitchRoute(TWITCH_REDEEM_ACTION_TYPE, rewardId);

    if (!route) {
      return;
    }

    await this.enqueue({
      text: input || 'Someone redeemed TTS without a message.',
      username,
      source: 'twitch-redeem',
      queueId: route.queueId,
      actionType: TWITCH_REDEEM_ACTION_TYPE,
      actionId: rewardId,
      charLimit: route.characterLimit,
    });
  }

  private logStreamStart(user: Pick<TwitchValidateResponse, 'user_id' | 'login'>): void {
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO stream_sessions (id, twitch_channel_id, twitch_channel_name, started_at)
      VALUES (?, ?, ?, ?)
    `).run(crypto.randomUUID(), user.user_id, user.login, now);
  }

  private logStreamEnd(): void {
    this.db.prepare(`
      UPDATE stream_sessions
      SET ended_at = ?
      WHERE ended_at IS NULL AND deleted_at IS NULL
    `).run(new Date().toISOString());
  }

  private formatError(error: unknown): string {
    return error instanceof Error ? `${error.name}: ${error.message}` : JSON.stringify(error);
  }
}

export function parseTwitchDuration(duration: string | undefined): number | null {
  if (!duration) {
    return null;
  }

  const match = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(duration);
  if (!match) {
    return null;
  }

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);

  return ((hours * 60 + minutes) * 60 + seconds) * 1000;
}
