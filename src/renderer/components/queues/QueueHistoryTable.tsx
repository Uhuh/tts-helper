import { Button, Chip } from '@heroui/react';
import { Play, Plus, Trash2 } from 'lucide-react';
import type { QueueItemRecord } from '../../../shared/types';
import './queue-console.css';

export function QueueHistoryTable({ items, refresh }: { items: QueueItemRecord[]; refresh(): Promise<void> }) {
  if (!items.length) {
    return <div className="queue-empty-state">No queue items yet.</div>;
  }

  return (
    <div className="queue-table-wrap">
      <table className="queue-item-table">
        <thead>
          <tr>
            <th>Viewer</th>
            <th>Message</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Requested</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.username}</td>
              <td className="queue-text-cell">{item.text}</td>
              <td><StatusBadge status={item.status} /></td>
              <td>{item.priority}</td>
              <td>{new Date(item.requestedAt).toLocaleString()}</td>
              <td>
                <div className="queue-item-actions">
                  <Button
                    aria-label={`Play ${item.username} item now`}
                    isDisabled={item.status !== 'queued'}
                    isIconOnly
                    onPress={() => {
                      void window.ttsHelper.playItemNow(item.id).then(refresh);
                    }}
                    size="sm"
                    variant="tertiary"
                  >
                    <Play size={15} />
                  </Button>
                  <Button
                    aria-label={`Requeue ${item.username} item`}
                    isIconOnly
                    onPress={() => {
                      void window.ttsHelper.requeueItem(item.id).then(refresh);
                    }}
                    size="sm"
                    variant="tertiary"
                  >
                    <Plus size={15} />
                  </Button>
                  <Button
                    aria-label={`Delete ${item.username} item`}
                    isDisabled={item.status === 'playing'}
                    isIconOnly
                    onPress={() => {
                      void window.ttsHelper.deleteItem(item.id).then(refresh);
                    }}
                    size="sm"
                    variant="danger-soft"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ status }: { status: QueueItemRecord['status'] }) {
  const color = status === 'finished'
    ? 'success'
    : status === 'playing' || status === 'queued'
      ? 'accent'
      : status === 'failed' || status === 'stopped' || status === 'skipped'
        ? 'danger'
        : 'default';

  return (
    <Chip color={color} size="sm" variant="soft">
      {status.replace('_', ' ')}
    </Chip>
  );
}
