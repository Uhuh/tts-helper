import type { QueueItemRecord } from '../../../shared/types';

export interface QueueStats {
  pending: number;
  playing: number;
  played: number;
  other: number;
  total: number;
}

export function getQueueStats(items: QueueItemRecord[]): QueueStats {
  return items.reduce<QueueStats>((stats, item) => {
    stats.total += 1;

    if (item.status === 'pending_audio' || item.status === 'queued') {
      stats.pending += 1;
    } else if (item.status === 'playing') {
      stats.playing += 1;
    } else if (item.status === 'finished') {
      stats.played += 1;
    } else {
      stats.other += 1;
    }

    return stats;
  }, {
    pending: 0,
    playing: 0,
    played: 0,
    other: 0,
    total: 0,
  });
}
