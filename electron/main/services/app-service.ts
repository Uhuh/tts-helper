import type { BrowserWindow } from 'electron';
import type {
  AppState,
  EnqueueRequest,
  PartialDeep,
  QueueItemRecord,
  UpdateQueueInput,
  CreateQueueInput,
  AppSettings,
  TwitchOAuthCompleteInput,
  TwitchOAuthStartInput,
  TwitchOAuthStartResult,
} from '../../../src/shared/types';
import type { LogService } from './log-service';
import type { PlaybackService } from './playback-service';
import type { QueueRepository } from './queue-repository';
import type { SettingsService } from './settings-service';
import type { StreamlabsTtsService } from './streamlabs-tts-service';
import type { TwitchService } from './twitch-service';

export class AppService {
  private twitchService: TwitchService | null = null;

  constructor(
    private readonly queues: QueueRepository,
    private readonly settings: SettingsService,
    private readonly tts: StreamlabsTtsService,
    private readonly playback: PlaybackService,
    private readonly logs: LogService,
    private readonly getWindow: () => BrowserWindow | null,
  ) {}

  attachTwitch(service: TwitchService): void {
    this.twitchService = service;
  }

  getState(): AppState {
    return {
      queues: this.queues.listQueues(),
      playback: this.playback.state(),
      settings: this.settings.get(),
      logs: this.logs.list(),
    };
  }

  broadcastState(): void {
    this.getWindow()?.webContents.send('state:changed', this.getState());
  }

  async enqueue(input: EnqueueRequest): Promise<QueueItemRecord> {
    const settings = this.settings.get();
    const charLimit = input.charLimit ?? settings.tts.defaultCharacterLimit;
    const item = this.queues.enqueuePending({
      ...input,
      charLimit,
    });

    this.broadcastState();

    try {
      const audioPath = await this.tts.generate(item, settings.tts);
      const queued = this.queues.markAudioReady(item.id, audioPath);
      this.broadcastState();
      await this.playback.playNext();
      return queued;
    } catch (error) {
      const failed = this.queues.markFailed(item.id, this.formatError(error));
      this.logs.add('error', 'AppService.enqueue', this.formatError(error));
      this.broadcastState();
      if (!failed) {
        throw error;
      }
      return failed;
    }
  }

  async requeue(id: string): Promise<QueueItemRecord> {
    const item = this.queues.requeue(id);
    this.broadcastState();

    try {
      const audioPath = await this.tts.generate(item, this.settings.get().tts);
      const queued = this.queues.markAudioReady(item.id, audioPath);
      this.broadcastState();
      await this.playback.playNext();
      return queued;
    } catch (error) {
      const failed = this.queues.markFailed(item.id, this.formatError(error));
      this.broadcastState();
      return failed ?? item;
    }
  }

  createQueue(input: CreateQueueInput) {
    const queue = this.queues.createQueue(input);
    this.broadcastState();
    return queue;
  }

  updateQueue(input: UpdateQueueInput) {
    const queue = this.queues.updateQueue(input);
    this.broadcastState();
    void this.playback.playNext();
    return queue;
  }

  deleteQueue(id: string): void {
    this.queues.deleteQueue(id);
    this.broadcastState();
  }

  deleteItem(id: string): void {
    this.queues.softDeleteItem(id);
    this.broadcastState();
  }

  async updateSettings(patch: PartialDeep<AppSettings>): Promise<AppSettings> {
    const next = this.settings.update(patch);
    this.broadcastState();
    await this.twitchService?.syncFromSettings();
    return next;
  }

  async startTwitchOAuth(input?: TwitchOAuthStartInput): Promise<TwitchOAuthStartResult> {
    if (!this.twitchService) {
      throw new Error('Twitch service is not ready.');
    }

    const result = await this.twitchService.startOAuth(input);
    this.broadcastState();
    return result;
  }

  async completeTwitchOAuth(input: TwitchOAuthCompleteInput): Promise<AppSettings> {
    if (!this.twitchService) {
      throw new Error('Twitch service is not ready.');
    }

    await this.twitchService.completeOAuth(input);
    this.broadcastState();
    await this.twitchService.syncFromSettings();
    this.broadcastState();
    return this.settings.get();
  }

  async disconnectTwitch(): Promise<AppSettings> {
    await this.twitchService?.clearAuthorization();
    this.broadcastState();
    return this.settings.get();
  }

  private formatError(error: unknown): string {
    return error instanceof Error ? `${error.name}: ${error.message}` : JSON.stringify(error);
  }
}
