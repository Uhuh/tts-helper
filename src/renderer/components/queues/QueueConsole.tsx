import type { AppState } from '../../../shared/types';
import { QueueCard } from './QueueCard';
import { QueueForms } from './QueueForms';
import { QueueOrderTable } from './QueueOrderTable';
import { QueueToolbar } from './QueueToolbar';
import './queue-console.css';

interface Props {
  state: AppState;
  refresh(): Promise<void>;
}

export function QueueConsole({ state, refresh }: Props) {
  return (
    <div className="queue-console" data-testid="queue-console">
      <QueueToolbar playback={state.playback} queues={state.queues} />
      <QueueForms queues={state.queues} refresh={refresh} />
      <QueueOrderTable queues={state.queues} refresh={refresh} />
      <section className="queue-card-grid" aria-label="Queues">
        {state.queues.map((queue) => (
          <QueueCard key={queue.id} queue={queue} refresh={refresh} />
        ))}
      </section>
    </div>
  );
}
