import { describe, expect, it } from 'vitest';
import { openDatabase } from '../../electron/main/db/database';
import { QueueRepository } from '../../electron/main/services/queue-repository';

function queueItem(repo: QueueRepository, queueId: string, text: string, priority = 0) {
  const item = repo.enqueuePending({ text, username: 'viewer', queueId, priority });
  return repo.markAudioReady(item.id, `/tmp/${item.id}.mp3`);
}

describe('queue scheduler', () => {
  it('selects from the highest-priority active queue first', () => {
    const repo = new QueueRepository(openDatabase());
    const low = repo.createQueue({ name: 'Low', priority: 1 });
    const high = repo.createQueue({ name: 'High', priority: 10 });
    queueItem(repo, low.id, 'low');
    const expected = queueItem(repo, high.id, 'high');

    expect(repo.selectNextItem()?.id).toBe(expected.id);
  });

  it('supports FIFO, LIFO, and item priority ordering', () => {
    const db = openDatabase();
    const repo = new QueueRepository(db);
    repo.updateQueue({ id: 'default', sortMode: 'fifo' });
    const first = queueItem(repo, 'default', 'first');
    const second = queueItem(repo, 'default', 'second');
    db.prepare('UPDATE queue_items SET requested_at = ? WHERE id = ?').run('2026-01-01T00:00:00.000Z', first.id);
    db.prepare('UPDATE queue_items SET requested_at = ? WHERE id = ?').run('2026-01-01T00:01:00.000Z', second.id);
    expect(repo.selectNextItem()?.id).toBe(first.id);

    repo.updateQueue({ id: 'default', sortMode: 'lifo' });
    expect(repo.selectNextItem()?.id).toBe(second.id);

    repo.updateQueue({ id: 'default', sortMode: 'priority' });
    const urgent = queueItem(repo, 'default', 'urgent', 100);
    expect(repo.selectNextItem()?.id).toBe(urgent.id);
  });

  it('ignores paused queues', () => {
    const repo = new QueueRepository(openDatabase());
    const queue = repo.createQueue({ name: 'Paused', priority: 99, paused: true });
    queueItem(repo, queue.id, 'paused');
    const fallback = queueItem(repo, 'default', 'default');

    expect(repo.selectNextItem()?.id).toBe(fallback.id);
  });
});
