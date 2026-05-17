export type QueueSortMode = 'fifo' | 'lifo' | 'priority';

export type QueueItemStatus =
  | 'pending_audio'
  | 'queued'
  | 'playing'
  | 'finished'
  | 'skipped'
  | 'stopped'
  | 'failed';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface QueueRecord {
  id: string;
  name: string;
  priority: number;
  sortMode: QueueSortMode;
  paused: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface QueueTwitchRouteConfig {
  enabled: boolean;
  actionId: string;
  characterLimit: number;
}

export interface QueueTwitchRoutes {
  chat: QueueTwitchRouteConfig;
  redeem: QueueTwitchRouteConfig;
}

export interface QueueItemRecord {
  id: string;
  queueId: string;
  actionType: string;
  actionId: string | null;
  source: string;
  username: string;
  text: string;
  status: QueueItemStatus;
  priority: number;
  requestedAt: string;
  audioPath: string | null;
  audioUrl: string | null;
  vodOffsetMs: number | null;
  playedAt: string | null;
  finishedAt: string | null;
  failedReason: string | null;
  deletedAt: string | null;
}

export interface QueueOverview extends QueueRecord {
  items: QueueItemRecord[];
  twitchRoutes: QueueTwitchRoutes;
}

export interface ActionRouteRecord {
  id: string;
  actionType: string;
  actionId: string | null;
  queueId: string;
  enabled: boolean;
  characterLimit: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface LogRecord {
  id: string;
  level: LogLevel;
  scope: string;
  message: string;
  createdAt: string;
}

export interface TtsSettings {
  voice: string;
  language: string;
  defaultCharacterLimit: number;
  monitorAudioEnabled: boolean;
  monitorOutputDeviceId: string;
}

export interface ObsSettings {
  enabled: boolean;
  url: string;
  password: string;
  browserSourceCaptionsEnabled: boolean;
  browserSourceAudioEnabled: boolean;
}

export interface DiscordSettings {
  webhookUrl: string;
}

export interface TwitchSettings {
  enabled: boolean;
  clientId: string;
  token: string;
  refreshToken: string;
  tokenExpiresAt: string | null;
  channelId: string;
  channelName: string;
  redeemEnabled: boolean;
  redeemId: string;
  redeemCharacterLimit: number;
  chatEnabled: boolean;
  chatCommand: string;
  chatCharacterLimit: number;
}

export interface AppSettings {
  tts: TtsSettings;
  obs: ObsSettings;
  discord: DiscordSettings;
  twitch: TwitchSettings;
}

export interface EnqueueRequest {
  text: string;
  username: string;
  source?: string;
  queueId?: string;
  actionType?: string;
  actionId?: string | null;
  charLimit?: number;
  priority?: number;
  bypassFilters?: boolean;
}

export interface CreateQueueInput {
  name: string;
  priority?: number;
  sortMode?: QueueSortMode;
  paused?: boolean;
  twitchRoutes?: PartialDeep<QueueTwitchRoutes>;
}

export interface UpdateQueueInput {
  id: string;
  name?: string;
  priority?: number;
  sortMode?: QueueSortMode;
  paused?: boolean;
  twitchRoutes?: PartialDeep<QueueTwitchRoutes>;
}

export interface ReorderQueuesInput {
  queueIds: string[];
}

export interface PlaybackState {
  paused: boolean;
  currentItem: QueueItemRecord | null;
}

export interface AppState {
  queues: QueueOverview[];
  playback: PlaybackState;
  settings: AppSettings;
  logs: LogRecord[];
}

export interface PlaybackItemPayload {
  item: QueueItemRecord;
}

export type PlaybackControlPayload =
  | { command: 'pause' }
  | { command: 'resume' }
  | { command: 'stop' };

export interface RendererPlaybackResult {
  itemId: string;
  reason?: string;
}

export interface TwitchOAuthStartInput {
  clientId?: string;
  forceVerify?: boolean;
}

export interface TwitchOAuthStartResult {
  authorizationUrl: string;
  redirectUri: string | null;
  userCode: string;
  expiresAt: string;
  intervalSeconds: number;
  scopes: string[];
}

export interface TwitchOAuthCompleteInput {
  accessToken?: string;
  tokenType?: string;
  scope?: string;
  state: string;
  expiresIn?: number;
  error?: string;
  errorDescription?: string;
}

export interface IpcApi {
  getAppState(): Promise<AppState>;
  listQueues(): Promise<QueueOverview[]>;
  createQueue(input: CreateQueueInput): Promise<QueueRecord>;
  updateQueue(input: UpdateQueueInput): Promise<QueueRecord>;
  reorderQueues(input: ReorderQueuesInput): Promise<QueueOverview[]>;
  deleteQueue(id: string): Promise<void>;
  enqueueItem(input: EnqueueRequest): Promise<QueueItemRecord>;
  requeueItem(id: string): Promise<QueueItemRecord>;
  deleteItem(id: string): Promise<void>;
  playItemNow(id: string): Promise<QueueItemRecord | null>;
  pausePlayback(): Promise<PlaybackState>;
  resumePlayback(): Promise<PlaybackState>;
  togglePlayback(): Promise<PlaybackState>;
  stopCurrent(): Promise<PlaybackState>;
  skipCurrent(): Promise<PlaybackState>;
  playNext(): Promise<QueueItemRecord | null>;
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: PartialDeep<AppSettings>): Promise<AppSettings>;
  startTwitchOAuth(input?: TwitchOAuthStartInput): Promise<TwitchOAuthStartResult>;
  disconnectTwitch(): Promise<AppSettings>;
  getLogs(): Promise<LogRecord[]>;
  rendererFinished(result: RendererPlaybackResult): Promise<void>;
  rendererFailed(result: RendererPlaybackResult): Promise<void>;
  onPlaybackItem(callback: (payload: PlaybackItemPayload) => void): () => void;
  onPlaybackControl(callback: (payload: PlaybackControlPayload) => void): () => void;
  onStateChanged(callback: (state: AppState) => void): () => void;
}

export type PartialDeep<T> = {
  [K in keyof T]?: T[K] extends object ? PartialDeep<T[K]> : T[K];
};

export const DEFAULT_QUEUE_ID = 'default';

export const TWITCH_OAUTH_SCOPES = ['chat:read', 'channel:read:redemptions'];
export const TWITCH_CHAT_ACTION_TYPE = 'twitch-chat-command';
export const TWITCH_REDEEM_ACTION_TYPE = 'twitch-redeem';
export const DEFAULT_QUEUE_TWITCH_ROUTES: QueueTwitchRoutes = {
  chat: {
    enabled: false,
    actionId: '!say',
    characterLimit: 300,
  },
  redeem: {
    enabled: false,
    actionId: '',
    characterLimit: 300,
  },
};

export const DEFAULT_SETTINGS: AppSettings = {
  tts: {
    voice: 'Ivy',
    language: 'US English',
    defaultCharacterLimit: 300,
    monitorAudioEnabled: true,
    monitorOutputDeviceId: 'default',
  },
  obs: {
    enabled: false,
    url: 'ws://127.0.0.1:4455',
    password: '',
    browserSourceCaptionsEnabled: true,
    browserSourceAudioEnabled: false,
  },
  discord: {
    webhookUrl: '',
  },
  twitch: {
    enabled: false,
    clientId: 'fprxp4ve0scf8xg6y48nwcq1iogxuq',
    token: '',
    refreshToken: '',
    tokenExpiresAt: null,
    channelId: '',
    channelName: '',
    redeemEnabled: true,
    redeemId: '',
    redeemCharacterLimit: 300,
    chatEnabled: false,
    chatCommand: '!say',
    chatCharacterLimit: 300,
  },
};
