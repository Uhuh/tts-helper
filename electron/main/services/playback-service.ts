import type { BrowserWindow } from 'electron';
import type {
  PlaybackControlPayload,
  PlaybackItemPayload,
  PlaybackState,
  QueueItemRecord,
} from '../../../src/shared/types';
import type { DiscordWebhookService } from './discord-webhook-service';
import type { LogService } from './log-service';
import type { ObsService } from './obs-service';
import type { OverlayService } from './overlay-service';
import type { QueueRepository } from './queue-repository';
import type { SettingsService } from './settings-service';

export class PlaybackService {
  private paused = false;

  constructor(
    private readonly queues: QueueRepository,
    private readonly settings: SettingsService,
    private readonly obs: ObsService,
    private readonly overlay: OverlayService,
    private readonly discord: DiscordWebhookService,
    private readonly logs: LogService,
    private readonly getWindow: () => BrowserWindow | null,
    private readonly broadcastState: () => void,
  ) {}

  recoverOrphanedPlayback(): void {
    const current = this.queues.getCurrentItem();
    if (current) {
      this.queues.updateStatus(current.id, 'stopped', {
        finishedAt: new Date().toISOString(),
      });
    }
  }

  state(): PlaybackState {
    return {
      paused: this.paused,
      currentItem: this.queues.getCurrentItem(),
    };
  }

  pause(): PlaybackState {
    this.paused = true;
    this.sendControl({ command: 'pause' });
    this.broadcastState();
    return this.state();
  }

  resume(): PlaybackState {
    this.paused = false;
    this.sendControl({ command: 'resume' });
    void this.playNext();
    this.broadcastState();
    return this.state();
  }

  toggle(): PlaybackState {
    return this.paused ? this.resume() : this.pause();
  }

  async playNext(): Promise<QueueItemRecord | null> {
    if (this.paused) {
      return null;
    }

    const current = this.queues.getCurrentItem();
    if (current) {
      return current;
    }

    const next = this.queues.selectNextItem();
    if (!next) {
      this.broadcastState();
      return null;
    }

    return this.startItem(next);
  }

  async playItemNow(id: string): Promise<QueueItemRecord | null> {
    if (this.queues.getCurrentItem()) {
      throw new Error('Cannot play an item now while another item is playing.');
    }

    const item = this.queues.getItem(id);
    if (!item) {
      throw new Error(`Queue item ${id} does not exist.`);
    }

    if (item.status !== 'queued') {
      throw new Error(`Queue item ${id} is ${item.status}, not queued.`);
    }

    return this.startItem(item);
  }

  async finishItem(id: string): Promise<void> {
    const finishedAt = new Date().toISOString();
    const item = this.queues.updateStatus(id, 'finished', { finishedAt });

    if (item) {
      this.discord.createPendingJob(item);
      void this.discord.processPendingJobs();
      this.logs.add('info', 'PlaybackService.finishItem', `Finished item ${id}.`);
    }

    this.overlay.clearCaptions();
    this.broadcastState();
    await this.playNext();
  }

  async failItem(id: string, reason: string): Promise<void> {
    this.queues.updateStatus(id, 'failed', {
      failedReason: reason,
      finishedAt: new Date().toISOString(),
    });
    this.overlay.clearCaptions();
    this.logs.add('error', 'PlaybackService.failItem', `Playback failed for ${id}: ${reason}`);
    this.broadcastState();
    await this.playNext();
  }

  async skipCurrent(): Promise<PlaybackState> {
    const current = this.queues.getCurrentItem();
    if (!current) {
      return this.state();
    }

    this.queues.updateStatus(current.id, 'skipped', {
      finishedAt: new Date().toISOString(),
    });
    this.sendControl({ command: 'stop' });
    this.overlay.clearCaptions();
    this.logs.add('info', 'PlaybackService.skipCurrent', `Skipped item ${current.id}.`);
    this.broadcastState();
    await this.playNext();

    return this.state();
  }

  stopCurrent(): PlaybackState {
    const current = this.queues.getCurrentItem();
    if (!current) {
      return this.state();
    }

    this.queues.updateStatus(current.id, 'stopped', {
      finishedAt: new Date().toISOString(),
    });
    this.sendControl({ command: 'stop' });
    this.overlay.clearCaptions();
    this.logs.add('info', 'PlaybackService.stopCurrent', `Stopped item ${current.id}.`);
    this.broadcastState();

    return this.state();
  }

  private async startItem(item: QueueItemRecord): Promise<QueueItemRecord> {
    const playedAt = new Date().toISOString();
    const vodOffsetMs = await this.obs.getStreamOffsetMs(this.settings.get().obs);
    const playing = this.queues.updateStatus(item.id, 'playing', {
      playedAt,
      vodOffsetMs,
    });

    if (!playing?.audioUrl) {
      throw new Error(`Queue item ${item.id} has no playable audio URL.`);
    }

    this.overlay.nowPlaying(playing);
    this.sendItem(playing);
    this.logs.add('info', 'PlaybackService.startItem', `Started item ${item.id}.`);
    this.broadcastState();

    return playing;
  }

  private sendItem(item: QueueItemRecord): void {
    const payload: PlaybackItemPayload = { item };
    this.getWindow()?.webContents.send('playback:item', payload);
  }

  private sendControl(payload: PlaybackControlPayload): void {
    this.getWindow()?.webContents.send('playback:control', payload);
  }
}
