import { Button, Card, Chip, Table } from '@heroui/react';
import { GripVertical } from 'lucide-react';
import { useDragAndDrop } from 'react-aria-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { QueueOverview } from '../../../shared/types';
import { getQueueStats } from './queueStats';

interface Props {
  queues: QueueOverview[];
  refresh(): Promise<void>;
}

export function QueueOrderTable({ queues, refresh }: Props) {
  const [orderedIds, setOrderedIds] = useState(() => queues.map((queue) => queue.id));

  useEffect(() => {
    setOrderedIds(queues.map((queue) => queue.id));
  }, [queues]);

  const orderedQueues = useMemo(() => {
    const byId = new Map(queues.map((queue) => [queue.id, queue]));
    return orderedIds
      .map((id) => byId.get(id))
      .filter((queue): queue is QueueOverview => Boolean(queue));
  }, [orderedIds, queues]);

  const persistOrder = useCallback(async (next: string[]) => {
    setOrderedIds(next);

    try {
      await window.ttsHelper.reorderQueues({ queueIds: next });
      await refresh();
    } catch (error) {
      setOrderedIds(queues.map((queue) => queue.id));
      console.error(error);
    }
  }, [queues, refresh]);

  const { dragAndDropHooks } = useDragAndDrop<QueueOverview>({
    getItems: (keys) => Array.from(keys, (key) => ({
      'text/plain': String(key),
    })),
    onReorder: (event) => {
      const movedIds = Array.from(event.keys, String);
      const targetId = String(event.target.key);
      const next = orderedIds.filter((id) => !movedIds.includes(id));
      const targetIndex = next.indexOf(targetId);

      if (targetIndex === -1) {
        return;
      }

      const insertIndex = event.target.dropPosition === 'after' ? targetIndex + 1 : targetIndex;
      next.splice(insertIndex, 0, ...movedIds);

      void persistOrder(next);
    },
  });

  return (
    <Card className="queue-order-card" variant="default">
      <Card.Header>
        <Card.Title>Queue order</Card.Title>
      </Card.Header>
      <Card.Content>
        <Table className="queue-order-table" variant="secondary">
          <Table.ScrollContainer>
            <Table.Content aria-label="Queue priority order" dragAndDropHooks={dragAndDropHooks}>
              <Table.Header>
                <Table.Column id="order">Order</Table.Column>
                <Table.Column id="queue" isRowHeader>Queue</Table.Column>
                <Table.Column id="state">State</Table.Column>
                <Table.Column id="pending">Pending</Table.Column>
                <Table.Column id="played">Played</Table.Column>
                <Table.Column id="sort">Sort</Table.Column>
              </Table.Header>
              <Table.Body items={orderedQueues}>
                {(queue) => {
                  const stats = getQueueStats(queue.items);
                  const index = orderedQueues.findIndex((candidate) => candidate.id === queue.id);
                  return (
                    <Table.Row
                      className="queue-order-row"
                      id={queue.id}
                    >
                      <Table.Cell>
                        <span className="queue-order-rank">
                          <Button
                            aria-label={`Reorder ${queue.name}`}
                            className="queue-order-drag-handle"
                            isIconOnly
                            slot="drag"
                            variant="tertiary"
                          >
                            <GripVertical size={16} aria-hidden="true" />
                          </Button>
                          {index + 1}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <strong>{queue.name}</strong>
                      </Table.Cell>
                      <Table.Cell>
                        <Chip color={queue.paused ? 'warning' : 'success'} size="sm" variant="soft">
                          {queue.paused ? 'Paused' : 'Active'}
                        </Chip>
                      </Table.Cell>
                      <Table.Cell>{stats.pending}</Table.Cell>
                      <Table.Cell>{stats.played}</Table.Cell>
                      <Table.Cell>{queue.sortMode}</Table.Cell>
                    </Table.Row>
                  );
                }}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </Card.Content>
    </Card>
  );
}
