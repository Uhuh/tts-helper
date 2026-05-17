import type { AppState } from '../../shared/types';
import { QueueHistoryTable } from './queues/QueueHistoryTable';

interface Props {
  state: AppState;
  refresh(): Promise<void>;
}

export function HistoryView({ state, refresh }: Props) {
  const items = state.queues
    .flatMap((queue) => queue.items)
    .filter((item) => ['finished', 'skipped', 'stopped', 'failed'].includes(item.status));

  return (
    <section className="panel">
      <h2>Playback history</h2>
      <QueueHistoryTable items={items} refresh={refresh} />
    </section>
  );
}
