import { describe, expect, it, vi } from 'vitest';
import { openDatabase } from '../../electron/main/db/database';
import { LogService } from '../../electron/main/services/log-service';
import { OverlayService } from '../../electron/main/services/overlay-service';
import { PlaybackService } from '../../electron/main/services/playback-service';
import { QueueRepository } from '../../electron/main/services/queue-repository';
import { SettingsService } from '../../electron/main/services/settings-service';

function setup() {
  const db = openDatabase();
  const queues = new QueueRepository(db);
  const send = vi.fn();
  const playback = new PlaybackService(
    queues,
    new SettingsService(db),
    { getStreamOffsetMs: vi.fn(async () => 123_000) },
    new OverlayService(),
    { createPendingJob: vi.fn(), processPendingJobs: vi.fn(async () => undefined) },
    new LogService(db),
    () => ({ webContents: { send } }) as never,
    vi.fn(),
  );

  const pending = queues.enqueuePending({ text: 'hello', username: 'viewer' });
  const item = queues.markAudioReady(pending.id, '/tmp/audio.mp3');

  return { queues, playback, send, item };
}

describe('PlaybackService', () => {
  it('plays next queued item and sends it to the renderer', async () => {
    const { playback, queues, send, item } = setup();

    const playing = await playback.playNext();

    expect(playing?.id).toBe(item.id);
    expect(queues.getItem(item.id)?.status).toBe('playing');
    expect(queues.getItem(item.id)?.vodOffsetMs).toBe(123_000);
    expect(send).toHaveBeenCalledWith('playback:item', expect.objectContaining({
      item: expect.objectContaining({ id: item.id }),
    }));
  });

  it('skipCurrent marks skipped and advances scheduler', async () => {
    const { playback, queues, item } = setup();
    await playback.playNext();

    await playback.skipCurrent();

    expect(queues.getItem(item.id)?.status).toBe('skipped');
  });

  it('stopCurrent marks stopped without assuming FIFO', async () => {
    const { playback, queues, item } = setup();
    await playback.playNext();

    playback.stopCurrent();

    expect(queues.getItem(item.id)?.status).toBe('stopped');
  });
});
