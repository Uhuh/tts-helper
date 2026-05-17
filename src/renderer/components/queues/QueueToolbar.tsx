import { Button } from '@heroui/react';
import { Pause, Play, SkipForward, Square } from 'lucide-react';
import type { PlaybackState, QueueOverview } from '../../../shared/types';
import { getQueueStats } from './queueStats';

interface Props {
  playback: PlaybackState;
  queues: QueueOverview[];
}

export function QueueToolbar({ playback, queues }: Props) {
  const totals = {
    pending: 0,
    playing: 0,
    played: 0,
    other: 0,
    total: 0,
  };

  for (const queue of queues) {
    const stats = getQueueStats(queue.items);
    totals.pending += stats.pending;
    totals.playing += stats.playing;
    totals.played += stats.played;
    totals.other += stats.other;
    totals.total += stats.total;
  }

  return (
    <section className="queue-toolbar">
      <div className="queue-toolbar-actions">
        <Button onPress={() => { void window.ttsHelper.playNext(); }} variant="primary">
          <Play size={17} />
          Play next
        </Button>
        <Button onPress={() => { void window.ttsHelper.togglePlayback(); }} variant="tertiary">
          {playback.paused ? <Play size={17} /> : <Pause size={17} />}
          {playback.paused ? 'Resume' : 'Pause'}
        </Button>
        <Button onPress={() => { void window.ttsHelper.skipCurrent(); }} variant="tertiary">
          <SkipForward size={17} />
          Skip
        </Button>
        <Button onPress={() => { void window.ttsHelper.stopCurrent(); }} variant="danger-soft">
          <Square size={17} />
          Stop
        </Button>
      </div>
      <div className="queue-toolbar-metrics">
        <QueueMetric label="Queues" value={queues.length} />
        <QueueMetric label="Pending" value={totals.pending} />
        <QueueMetric label="Playing" value={playback.currentItem ? 1 : totals.playing} />
        <QueueMetric label="Played" value={totals.played} />
      </div>
    </section>
  );
}

function QueueMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="queue-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
