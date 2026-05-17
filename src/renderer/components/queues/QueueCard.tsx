import { Button, Card, Chip, Input, Switch } from '@heroui/react';
import { History, Pause, Play, Settings, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import type { QueueOverview, QueueSortMode, UpdateQueueInput } from '../../../shared/types';
import { QueueHistoryTable } from './QueueHistoryTable';
import { getQueueStats } from './queueStats';

type OpenPanel = 'settings' | 'history' | null;

interface Props {
  queue: QueueOverview;
  refresh(): Promise<void>;
}

export function QueueCard({ queue, refresh }: Props) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const stats = getQueueStats(queue.items);

  async function update(partial: Omit<UpdateQueueInput, 'id'>) {
    await window.ttsHelper.updateQueue({ id: queue.id, ...partial });
    await refresh();
  }

  return (
    <Card className="queue-summary-card" variant="default">
      <Card.Header className="queue-card-header">
        <div>
          <Card.Title className="queue-card-title">{queue.name}</Card.Title>
          <Card.Description>{stats.total} stored items</Card.Description>
        </div>
        <div className="queue-card-actions">
          <Button
            aria-label={queue.paused ? `Resume ${queue.name}` : `Pause ${queue.name}`}
            isIconOnly
            onPress={() => {
              void update({ paused: !queue.paused });
            }}
            variant={queue.paused ? 'primary' : 'tertiary'}
          >
            {queue.paused ? <Play size={17} /> : <Pause size={17} />}
          </Button>
          <Button
            aria-label={`${queue.name} settings`}
            isIconOnly
            onPress={() => setOpenPanel(openPanel === 'settings' ? null : 'settings')}
            variant={openPanel === 'settings' ? 'primary' : 'tertiary'}
          >
            <Settings size={17} />
          </Button>
          <Button
            aria-label={`Show ${queue.name} history`}
            onPress={() => setOpenPanel(openPanel === 'history' ? null : 'history')}
            variant={openPanel === 'history' ? 'primary' : 'tertiary'}
          >
            <History size={17} />
            History
          </Button>
          <Button
            aria-label={`Delete ${queue.name}`}
            isDisabled={queue.id === 'default'}
            isIconOnly
            onPress={() => {
              void window.ttsHelper.deleteQueue(queue.id).then(refresh);
            }}
            variant="danger-soft"
          >
            <Trash2 size={17} />
          </Button>
        </div>
      </Card.Header>
      <Card.Content>
        <div className="queue-stat-grid">
          <QueueStat label="Pending" value={stats.pending} tone={stats.pending ? 'accent' : 'default'} />
          <QueueStat label="Playing" value={stats.playing} tone={stats.playing ? 'success' : 'default'} />
          <QueueStat label="Played" value={stats.played} tone={stats.played ? 'success' : 'default'} />
          <QueueStat label="Other" value={stats.other} tone={stats.other ? 'warning' : 'default'} />
        </div>
        {openPanel === 'settings' ? <QueueSettingsPanel queue={queue} onSave={update} /> : null}
        {openPanel === 'history' ? (
          <section className="queue-history-panel" aria-label={`${queue.name} history`}>
            <QueueHistoryTable items={queue.items} refresh={refresh} />
          </section>
        ) : null}
      </Card.Content>
    </Card>
  );
}

function QueueStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'accent' | 'default' | 'success' | 'warning';
}) {
  return (
    <div className="queue-stat">
      <span>{label}</span>
      <Chip color={tone} size="sm" variant="soft">{value}</Chip>
    </div>
  );
}

function QueueSettingsPanel({
  queue,
  onSave,
}: {
  queue: QueueOverview;
  onSave(partial: Omit<UpdateQueueInput, 'id'>): Promise<void>;
}) {
  const [name, setName] = useState(queue.name);
  const [priority, setPriority] = useState(queue.priority);
  const [sortMode, setSortMode] = useState<QueueSortMode>(queue.sortMode);
  const [chatEnabled, setChatEnabled] = useState(queue.twitchRoutes.chat.enabled);
  const [chatActionId, setChatActionId] = useState(queue.twitchRoutes.chat.actionId);
  const [chatLimit, setChatLimit] = useState(queue.twitchRoutes.chat.characterLimit);
  const [redeemEnabled, setRedeemEnabled] = useState(queue.twitchRoutes.redeem.enabled);
  const [redeemActionId, setRedeemActionId] = useState(queue.twitchRoutes.redeem.actionId);
  const [redeemLimit, setRedeemLimit] = useState(queue.twitchRoutes.redeem.characterLimit);

  useEffect(() => {
    setName(queue.name);
    setPriority(queue.priority);
    setSortMode(queue.sortMode);
    setChatEnabled(queue.twitchRoutes.chat.enabled);
    setChatActionId(queue.twitchRoutes.chat.actionId);
    setChatLimit(queue.twitchRoutes.chat.characterLimit);
    setRedeemEnabled(queue.twitchRoutes.redeem.enabled);
    setRedeemActionId(queue.twitchRoutes.redeem.actionId);
    setRedeemLimit(queue.twitchRoutes.redeem.characterLimit);
  }, [queue]);

  async function save(event: FormEvent) {
    event.preventDefault();
    await onSave({
      name,
      priority,
      sortMode,
      twitchRoutes: {
        chat: {
          enabled: chatEnabled,
          actionId: chatActionId,
          characterLimit: chatLimit,
        },
        redeem: {
          enabled: redeemEnabled,
          actionId: redeemActionId,
          characterLimit: redeemLimit,
        },
      },
    });
  }

  return (
    <form className="queue-settings-panel" onSubmit={save}>
      <div className="queue-settings-grid">
        <label>
          Name
          <Input
            aria-label={`${queue.name} name`}
            disabled={queue.id === 'default'}
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </label>
        <label>
          Priority
          <Input
            aria-label={`${queue.name} priority`}
            onChange={(event) => setPriority(Number(event.target.value))}
            type="number"
            value={String(priority)}
          />
        </label>
        <label>
          Sort
          <select className="queue-select" value={sortMode} onChange={(event) => setSortMode(event.target.value as QueueSortMode)}>
            <option value="fifo">Oldest first</option>
            <option value="lifo">Newest first</option>
            <option value="priority">Item priority</option>
          </select>
        </label>
        <Switch isSelected={chatEnabled} onChange={setChatEnabled}>Chat command TTS</Switch>
        <label>
          Command
          <Input
            aria-label={`${queue.name} chat command`}
            onChange={(event) => setChatActionId(event.target.value)}
            value={chatActionId}
          />
        </label>
        <label>
          Chat limit
          <Input
            aria-label={`${queue.name} chat limit`}
            min={1}
            onChange={(event) => setChatLimit(Number(event.target.value))}
            type="number"
            value={String(chatLimit)}
          />
        </label>
        <Switch isSelected={redeemEnabled} onChange={setRedeemEnabled}>Channel point TTS</Switch>
        <label>
          Redeem ID
          <Input
            aria-label={`${queue.name} redeem ID`}
            onChange={(event) => setRedeemActionId(event.target.value)}
            value={redeemActionId}
          />
        </label>
        <label>
          Redeem limit
          <Input
            aria-label={`${queue.name} redeem limit`}
            min={1}
            onChange={(event) => setRedeemLimit(Number(event.target.value))}
            type="number"
            value={String(redeemLimit)}
          />
        </label>
      </div>
      <div className="queue-settings-actions">
        <Button type="submit" variant="primary">Save settings</Button>
      </div>
    </form>
  );
}
