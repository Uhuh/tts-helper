import { describe, expect, it } from 'vitest';
import { openDatabase } from '../../electron/main/db/database';
import { QueueRepository } from '../../electron/main/services/queue-repository';
import { DEFAULT_QUEUE_ID, TWITCH_CHAT_ACTION_TYPE, TWITCH_REDEEM_ACTION_TYPE } from '../../src/shared/types';

describe('QueueRepository', () => {
  it('seeds Default and rejects deleting it', () => {
    const db = openDatabase();
    const repo = new QueueRepository(db);

    const queues = repo.listQueues();
    expect(queues).toHaveLength(1);
    expect(queues[0].id).toBe(DEFAULT_QUEUE_ID);
    expect(queues[0].name).toBe('Default');

    expect(() => repo.deleteQueue(DEFAULT_QUEUE_ID)).toThrow('Default queue cannot be deleted');
  });

  it('soft deletes queues and queued items while keeping rows stored', () => {
    const db = openDatabase();
    const repo = new QueueRepository(db);
    const queue = repo.createQueue({ name: 'VIP' });
    const item = repo.enqueuePending({
      text: 'hello',
      username: 'ck',
      queueId: queue.id,
    });
    repo.markAudioReady(item.id, '/tmp/audio.mp3');

    repo.deleteQueue(queue.id);

    expect(repo.listQueues().map((q) => q.id)).not.toContain(queue.id);
    expect(repo.getItem(item.id)).toBeNull();
    expect(repo.getItem(item.id, true)?.deletedAt).toBeTruthy();
  });

  it('rejects deleting a queue with a playing item', () => {
    const db = openDatabase();
    const repo = new QueueRepository(db);
    const queue = repo.createQueue({ name: 'Live' });
    const item = repo.enqueuePending({ text: 'hello', username: 'ck', queueId: queue.id });
    repo.markAudioReady(item.id, '/tmp/audio.mp3');
    repo.updateStatus(item.id, 'playing', { playedAt: new Date().toISOString() });

    expect(() => repo.deleteQueue(queue.id)).toThrow('while one of its items is playing');
  });

  it('stores Twitch chat and redeem routes per queue', () => {
    const db = openDatabase();
    const repo = new QueueRepository(db);
    const queue = repo.createQueue({ name: 'VIP' });

    repo.updateQueue({
      id: queue.id,
      twitchRoutes: {
        chat: {
          enabled: true,
          actionId: '!vip',
          characterLimit: 120,
        },
        redeem: {
          enabled: true,
          actionId: 'reward-vip',
          characterLimit: 240,
        },
      },
    });

    const routes = repo.listQueues().find((candidate) => candidate.id === queue.id)?.twitchRoutes;
    expect(routes?.chat).toEqual({
      enabled: true,
      actionId: '!vip',
      characterLimit: 120,
    });
    expect(routes?.redeem).toEqual({
      enabled: true,
      actionId: 'reward-vip',
      characterLimit: 240,
    });
    expect(repo.findEnabledTwitchRoute(TWITCH_CHAT_ACTION_TYPE, '!vip')?.queueId).toBe(queue.id);
    expect(repo.findEnabledTwitchRoute(TWITCH_REDEEM_ACTION_TYPE, 'reward-vip')?.queueId).toBe(queue.id);
    expect(repo.resolveQueueForAction(TWITCH_CHAT_ACTION_TYPE, '!vip')).toBe(queue.id);

    repo.updateQueue({
      id: queue.id,
      twitchRoutes: {
        chat: {
          enabled: false,
        },
      },
    });

    expect(repo.findEnabledTwitchRoute(TWITCH_CHAT_ACTION_TYPE, '!vip')).toBeNull();
    expect(repo.resolveQueueForAction(TWITCH_CHAT_ACTION_TYPE, '!vip')).toBe(DEFAULT_QUEUE_ID);
  });

  it('rejects assigning one Twitch route to multiple queues', () => {
    const repo = new QueueRepository(openDatabase());
    const first = repo.createQueue({ name: 'First' });
    const second = repo.createQueue({ name: 'Second' });

    repo.updateQueue({
      id: first.id,
      twitchRoutes: {
        chat: {
          enabled: true,
          actionId: '!same',
        },
      },
    });

    expect(() => repo.updateQueue({
      id: second.id,
      twitchRoutes: {
        chat: {
          enabled: true,
          actionId: '!same',
        },
      },
    })).toThrow('already assigned');
  });
});
