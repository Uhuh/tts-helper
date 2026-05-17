import { Button, Card, Input } from '@heroui/react';
import { Plus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { QueueOverview } from '../../../shared/types';

interface Props {
  queues: QueueOverview[];
  refresh(): Promise<void>;
}

export function QueueForms({ queues, refresh }: Props) {
  return (
    <section className="queue-form-grid">
      <CreateQueueForm refresh={refresh} />
      <ManualTtsForm queues={queues} refresh={refresh} />
    </section>
  );
}

function CreateQueueForm({ refresh }: Pick<Props, 'refresh'>) {
  const [queueName, setQueueName] = useState('');

  async function createQueue(event: FormEvent) {
    event.preventDefault();
    if (!queueName.trim()) {
      return;
    }

    await window.ttsHelper.createQueue({
      name: queueName,
      priority: 0,
      sortMode: 'fifo',
    });
    setQueueName('');
    await refresh();
  }

  return (
    <Card className="queue-form-card" variant="default">
      <Card.Header>
        <Card.Title>Create queue</Card.Title>
      </Card.Header>
      <Card.Content>
        <form className="queue-form" onSubmit={createQueue}>
          <label>
            Name
            <Input
              aria-label="Queue name"
              onChange={(event) => setQueueName(event.target.value)}
              placeholder="VIP questions"
              value={queueName}
            />
          </label>
          <Button type="submit" variant="primary">
            <Plus size={17} />
            Create
          </Button>
        </form>
      </Card.Content>
    </Card>
  );
}

function ManualTtsForm({ queues, refresh }: Props) {
  const [manualText, setManualText] = useState('');
  const [manualUser, setManualUser] = useState('Streamer');
  const [manualQueueId, setManualQueueId] = useState('default');
  const [manualPriority, setManualPriority] = useState(0);

  async function enqueueManual(event: FormEvent) {
    event.preventDefault();
    if (!manualText.trim()) {
      return;
    }

    await window.ttsHelper.enqueueItem({
      text: manualText,
      username: manualUser,
      queueId: manualQueueId,
      priority: manualPriority,
      source: 'manual',
      actionType: 'manual',
    });
    setManualText('');
    await refresh();
  }

  return (
    <Card className="queue-form-card" variant="default">
      <Card.Header>
        <Card.Title>Manual TTS</Card.Title>
      </Card.Header>
      <Card.Content>
        <form className="queue-form queue-manual-form" onSubmit={enqueueManual}>
          <label>
            Viewer
            <Input
              aria-label="Manual TTS viewer"
              onChange={(event) => setManualUser(event.target.value)}
              value={manualUser}
            />
          </label>
          <label>
            Queue
            <select className="queue-select" value={manualQueueId} onChange={(event) => setManualQueueId(event.target.value)}>
              {queues.map((queue) => (
                <option key={queue.id} value={queue.id}>{queue.name}</option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <Input
              aria-label="Manual TTS priority"
              onChange={(event) => setManualPriority(Number(event.target.value))}
              type="number"
              value={String(manualPriority)}
            />
          </label>
          <label className="queue-wide-field">
            Text
            <textarea value={manualText} onChange={(event) => setManualText(event.target.value)} rows={3} />
          </label>
          <Button type="submit" variant="primary">
            <Plus size={17} />
            Queue TTS
          </Button>
        </form>
      </Card.Content>
    </Card>
  );
}
