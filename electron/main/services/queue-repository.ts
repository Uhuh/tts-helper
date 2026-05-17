import type Database from 'better-sqlite3';
import { pathToFileURL } from 'node:url';
import {
  DEFAULT_QUEUE_TWITCH_ROUTES,
  DEFAULT_QUEUE_ID,
  TWITCH_CHAT_ACTION_TYPE,
  TWITCH_REDEEM_ACTION_TYPE,
  type ActionRouteRecord,
  type CreateQueueInput,
  type EnqueueRequest,
  type PartialDeep,
  type QueueItemRecord,
  type QueueItemStatus,
  type QueueOverview,
  type QueueRecord,
  type ReorderQueuesInput,
  type QueueSortMode,
  type QueueTwitchRouteConfig,
  type QueueTwitchRoutes,
  type UpdateQueueInput,
} from '../../../src/shared/types';

interface QueueRow {
  id: string;
  name: string;
  priority: number;
  sortMode: QueueSortMode;
  paused: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface QueueItemRow {
  id: string;
  queueId: string;
  actionType: string;
  actionId: string | null;
  source: string;
  username: string;
  text: string;
  status: QueueItemStatus;
  priority: number;
  requestedAt: string;
  audioPath: string | null;
  vodOffsetMs: number | null;
  playedAt: string | null;
  finishedAt: string | null;
  failedReason: string | null;
  deletedAt: string | null;
}

interface ActionRouteRow {
  id: string;
  actionType: string;
  actionId: string | null;
  queueId: string;
  enabled: number;
  characterLimit: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

const queueColumns = `
  id,
  name,
  priority,
  sort_mode AS sortMode,
  paused,
  created_at AS createdAt,
  updated_at AS updatedAt,
  deleted_at AS deletedAt
`;

const itemColumns = `
  id,
  queue_id AS queueId,
  action_type AS actionType,
  action_id AS actionId,
  source,
  username,
  text,
  status,
  priority,
  requested_at AS requestedAt,
  audio_path AS audioPath,
  vod_offset_ms AS vodOffsetMs,
  played_at AS playedAt,
  finished_at AS finishedAt,
  failed_reason AS failedReason,
  deleted_at AS deletedAt
`;

const routeColumns = `
  id,
  action_type AS actionType,
  action_id AS actionId,
  queue_id AS queueId,
  enabled,
  character_limit AS characterLimit,
  created_at AS createdAt,
  updated_at AS updatedAt,
  deleted_at AS deletedAt
`;

function toQueue(row: QueueRow): QueueRecord {
  return {
    ...row,
    paused: Boolean(row.paused),
  };
}

function toActionRoute(row: ActionRouteRow): ActionRouteRecord {
  return {
    ...row,
    enabled: Boolean(row.enabled),
  };
}

function defaultTwitchRoutes(): QueueTwitchRoutes {
  return {
    chat: { ...DEFAULT_QUEUE_TWITCH_ROUTES.chat },
    redeem: { ...DEFAULT_QUEUE_TWITCH_ROUTES.redeem },
  };
}

export function toItem(row: QueueItemRow): QueueItemRecord {
  return {
    ...row,
    audioUrl: row.audioPath ? pathToFileURL(row.audioPath).toString() : null,
  };
}

export class QueueRepository {
  constructor(private readonly db: Database.Database) {}

  listQueues(): QueueOverview[] {
    const queues = this.db.prepare(`
      SELECT ${queueColumns}
      FROM queues
      WHERE deleted_at IS NULL
      ORDER BY priority DESC, created_at ASC
    `).all() as QueueRow[];

    const items = this.listItems();
    const byQueue = new Map<string, QueueItemRecord[]>();

    for (const item of items) {
      const queueItems = byQueue.get(item.queueId) ?? [];
      queueItems.push(item);
      byQueue.set(item.queueId, queueItems);
    }

    return queues.map((queue) => ({
      ...toQueue(queue),
      items: byQueue.get(queue.id) ?? [],
      twitchRoutes: this.getTwitchRoutesForQueue(queue.id),
    }));
  }

  listItems(includeDeleted = false): QueueItemRecord[] {
    const rows = this.db.prepare(`
      SELECT ${itemColumns}
      FROM queue_items
      ${includeDeleted ? '' : 'WHERE deleted_at IS NULL'}
      ORDER BY requested_at DESC
    `).all() as QueueItemRow[];

    return rows.map(toItem);
  }

  getQueue(id: string): QueueRecord | null {
    const row = this.db.prepare(`
      SELECT ${queueColumns}
      FROM queues
      WHERE id = ? AND deleted_at IS NULL
    `).get(id) as QueueRow | undefined;

    return row ? toQueue(row) : null;
  }

  getItem(id: string, includeDeleted = false): QueueItemRecord | null {
    const row = this.db.prepare(`
      SELECT ${itemColumns}
      FROM queue_items
      WHERE id = ? ${includeDeleted ? '' : 'AND deleted_at IS NULL'}
    `).get(id) as QueueItemRow | undefined;

    return row ? toItem(row) : null;
  }

  getCurrentItem(): QueueItemRecord | null {
    const row = this.db.prepare(`
      SELECT ${itemColumns}
      FROM queue_items
      WHERE status = 'playing' AND deleted_at IS NULL
      ORDER BY played_at DESC
      LIMIT 1
    `).get() as QueueItemRow | undefined;

    return row ? toItem(row) : null;
  }

  createQueue(input: CreateQueueInput): QueueRecord {
    const now = new Date().toISOString();
    const queue: QueueRecord = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      priority: input.priority ?? 0,
      sortMode: input.sortMode ?? 'fifo',
      paused: input.paused ?? false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    if (!queue.name) {
      throw new Error('Queue name is required.');
    }

    this.db.prepare(`
      INSERT INTO queues (id, name, priority, sort_mode, paused, created_at, updated_at)
      VALUES (@id, @name, @priority, @sortMode, @paused, @createdAt, @updatedAt)
    `).run({ ...queue, paused: queue.paused ? 1 : 0 });

    if (input.twitchRoutes) {
      this.updateQueueTwitchRoutes(queue.id, input.twitchRoutes);
    }

    return queue;
  }

  updateQueue(input: UpdateQueueInput): QueueRecord {
    const existing = this.getQueue(input.id);

    if (!existing) {
      throw new Error(`Queue ${input.id} does not exist.`);
    }

    const next: QueueRecord = {
      ...existing,
      name: input.id === DEFAULT_QUEUE_ID ? 'Default' : input.name?.trim() ?? existing.name,
      priority: input.priority ?? existing.priority,
      sortMode: input.sortMode ?? existing.sortMode,
      paused: input.paused ?? existing.paused,
      updatedAt: new Date().toISOString(),
    };

    if (!next.name) {
      throw new Error('Queue name is required.');
    }

    this.db.prepare(`
      UPDATE queues
      SET name = @name,
          priority = @priority,
          sort_mode = @sortMode,
          paused = @paused,
          updated_at = @updatedAt
      WHERE id = @id AND deleted_at IS NULL
    `).run({ ...next, paused: next.paused ? 1 : 0 });

    if (input.twitchRoutes) {
      this.updateQueueTwitchRoutes(input.id, input.twitchRoutes);
    }

    return next;
  }

  reorderQueues(input: ReorderQueuesInput): QueueOverview[] {
    const orderedIds = [...input.queueIds];
    const uniqueIds = new Set(orderedIds);
    const activeIds = this.listQueues().map((queue) => queue.id);

    if (orderedIds.length !== uniqueIds.size) {
      throw new Error('Queue order contains duplicate queues.');
    }

    if (orderedIds.length !== activeIds.length || activeIds.some((id) => !uniqueIds.has(id))) {
      throw new Error('Queue order must include every active queue.');
    }

    const now = new Date().toISOString();
    const update = this.db.prepare(`
      UPDATE queues
      SET priority = @priority,
          updated_at = @updatedAt
      WHERE id = @id AND deleted_at IS NULL
    `);
    const tx = this.db.transaction(() => {
      orderedIds.forEach((id, index) => {
        update.run({
          id,
          priority: orderedIds.length - index,
          updatedAt: now,
        });
      });
    });

    tx();
    return this.listQueues();
  }

  deleteQueue(id: string): void {
    if (id === DEFAULT_QUEUE_ID) {
      throw new Error('Default queue cannot be deleted.');
    }

    const queue = this.getQueue(id);
    if (!queue) {
      return;
    }

    const playing = this.db.prepare(`
      SELECT id
      FROM queue_items
      WHERE queue_id = ?
        AND status = 'playing'
        AND deleted_at IS NULL
      LIMIT 1
    `).get(id);

    if (playing) {
      throw new Error('Cannot delete a queue while one of its items is playing.');
    }

    const now = new Date().toISOString();
    const tx = this.db.transaction(() => {
      this.db.prepare('UPDATE queues SET deleted_at = ?, updated_at = ? WHERE id = ?').run(now, now, id);
      this.db.prepare(`
        UPDATE queue_items
        SET deleted_at = ?
        WHERE queue_id = ?
          AND status IN ('pending_audio', 'queued')
          AND deleted_at IS NULL
      `).run(now, id);
      this.db.prepare(`
        UPDATE action_routes
        SET queue_id = ?, updated_at = ?
        WHERE queue_id = ? AND deleted_at IS NULL
      `).run(DEFAULT_QUEUE_ID, now, id);
    });

    tx();
  }

  resolveQueueForAction(actionType: string, actionId?: string | null, requestedQueueId?: string): string {
    if (requestedQueueId && this.getQueue(requestedQueueId)) {
      return requestedQueueId;
    }

    const exact = actionId
      ? this.db.prepare(`
        SELECT queue_id AS queueId
        FROM action_routes
        WHERE action_type = ?
          AND action_id = ?
          AND enabled = 1
          AND deleted_at IS NULL
        LIMIT 1
      `).get(actionType, actionId) as { queueId: string } | undefined
      : undefined;

    if (exact?.queueId && this.getQueue(exact.queueId)) {
      return exact.queueId;
    }

    const fallback = this.db.prepare(`
      SELECT queue_id AS queueId
      FROM action_routes
      WHERE action_type = ?
        AND action_id IS NULL
        AND enabled = 1
        AND deleted_at IS NULL
      LIMIT 1
    `).get(actionType) as { queueId: string } | undefined;

    if (fallback?.queueId && this.getQueue(fallback.queueId)) {
      return fallback.queueId;
    }

    return DEFAULT_QUEUE_ID;
  }

  upsertActionRoute(
    actionType: string,
    actionId: string | null,
    queueId: string,
    options: { enabled?: boolean; characterLimit?: number } = {},
  ): ActionRouteRecord {
    const queue = this.getQueue(queueId);
    if (!queue) {
      throw new Error(`Queue ${queueId} does not exist.`);
    }

    const now = new Date().toISOString();
    const enabled = options.enabled ?? true;
    const characterLimit = Math.max(1, Math.trunc(options.characterLimit ?? 300));
    const route: ActionRouteRecord = {
      id: crypto.randomUUID(),
      actionType,
      actionId,
      queueId,
      enabled,
      characterLimit,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const existing = this.db.prepare(`
      SELECT id, created_at AS createdAt
      FROM action_routes
      WHERE action_type = ?
        AND COALESCE(action_id, '') = COALESCE(?, '')
        AND deleted_at IS NULL
      LIMIT 1
    `).get(actionType, actionId) as { id: string; createdAt: string } | undefined;

    if (existing) {
      this.db.prepare(`
        UPDATE action_routes
        SET action_id = ?,
            queue_id = ?,
            enabled = ?,
            character_limit = ?,
            updated_at = ?
        WHERE id = ?
      `).run(actionId, queueId, enabled ? 1 : 0, characterLimit, now, existing.id);

      return {
        ...route,
        id: existing.id,
        createdAt: existing.createdAt,
      };
    }

    this.db.prepare(`
      INSERT INTO action_routes (
        id,
        action_type,
        action_id,
        queue_id,
        enabled,
        character_limit,
        created_at,
        updated_at
      )
      VALUES (
        @id,
        @actionType,
        @actionId,
        @queueId,
        @enabled,
        @characterLimit,
        @createdAt,
        @updatedAt
      )
    `).run({ ...route, enabled: route.enabled ? 1 : 0 });

    return route;
  }

  listActionRoutes(): ActionRouteRecord[] {
    const rows = this.db.prepare(`
      SELECT ${routeColumns}
      FROM action_routes
      WHERE deleted_at IS NULL
      ORDER BY created_at ASC
    `).all() as ActionRouteRow[];

    return rows.map(toActionRoute);
  }

  getTwitchRoutesForQueue(queueId: string): QueueTwitchRoutes {
    const routes = defaultTwitchRoutes();
    const rows = this.db.prepare(`
      SELECT ${routeColumns}
      FROM action_routes
      WHERE queue_id = ?
        AND action_type IN (?, ?)
        AND deleted_at IS NULL
    `).all(queueId, TWITCH_CHAT_ACTION_TYPE, TWITCH_REDEEM_ACTION_TYPE) as ActionRouteRow[];

    for (const route of rows.map(toActionRoute)) {
      if (route.actionType === TWITCH_CHAT_ACTION_TYPE) {
        routes.chat = this.toTwitchRouteConfig(route, routes.chat);
      } else if (route.actionType === TWITCH_REDEEM_ACTION_TYPE) {
        routes.redeem = this.toTwitchRouteConfig(route, routes.redeem);
      }
    }

    return routes;
  }

  findEnabledTwitchRoute(actionType: string, actionId: string): ActionRouteRecord | null {
    const row = this.db.prepare(`
      SELECT ${routeColumns}
      FROM action_routes
      WHERE action_type = ?
        AND action_id = ?
        AND enabled = 1
        AND deleted_at IS NULL
      LIMIT 1
    `).get(actionType, actionId) as ActionRouteRow | undefined;

    if (!row || !this.getQueue(row.queueId)) {
      return null;
    }

    return toActionRoute(row);
  }

  enqueuePending(input: EnqueueRequest): QueueItemRecord {
    const queueId = this.resolveQueueForAction(input.actionType ?? 'manual', input.actionId, input.queueId);
    const requestedAt = new Date().toISOString();
    const text = input.charLimit && input.charLimit > 0
      ? input.text.substring(0, input.charLimit)
      : input.text;

    const item: QueueItemRecord = {
      id: crypto.randomUUID(),
      queueId,
      actionType: input.actionType ?? 'manual',
      actionId: input.actionId ?? null,
      source: input.source ?? 'manual',
      username: input.username.trim() || 'Anonymous',
      text,
      status: 'pending_audio',
      priority: input.priority ?? 0,
      requestedAt,
      audioPath: null,
      audioUrl: null,
      vodOffsetMs: null,
      playedAt: null,
      finishedAt: null,
      failedReason: null,
      deletedAt: null,
    };

    this.db.prepare(`
      INSERT INTO queue_items (
        id,
        queue_id,
        action_type,
        action_id,
        source,
        username,
        text,
        status,
        priority,
        requested_at
      ) VALUES (
        @id,
        @queueId,
        @actionType,
        @actionId,
        @source,
        @username,
        @text,
        @status,
        @priority,
        @requestedAt
      )
    `).run(item);

    return item;
  }

  private updateQueueTwitchRoutes(queueId: string, routes: PartialDeep<QueueTwitchRoutes>): void {
    if (routes.chat) {
      this.setQueueTwitchRoute(queueId, TWITCH_CHAT_ACTION_TYPE, routes.chat, DEFAULT_QUEUE_TWITCH_ROUTES.chat);
    }

    if (routes.redeem) {
      this.setQueueTwitchRoute(queueId, TWITCH_REDEEM_ACTION_TYPE, routes.redeem, DEFAULT_QUEUE_TWITCH_ROUTES.redeem);
    }
  }

  private setQueueTwitchRoute(
    queueId: string,
    actionType: string,
    input: Partial<QueueTwitchRouteConfig>,
    defaults: QueueTwitchRouteConfig,
  ): void {
    const existing = actionType === TWITCH_CHAT_ACTION_TYPE || actionType === TWITCH_REDEEM_ACTION_TYPE
      ? this.getTwitchRoutesForQueue(queueId)[actionType === TWITCH_CHAT_ACTION_TYPE ? 'chat' : 'redeem']
      : defaults;
    const actionId = (input.actionId ?? existing.actionId ?? defaults.actionId).trim();
    const enabled = input.enabled ?? existing.enabled ?? defaults.enabled;
    const characterLimit = input.characterLimit ?? existing.characterLimit ?? defaults.characterLimit;
    const existingRow = this.db.prepare(`
      SELECT ${routeColumns}
      FROM action_routes
      WHERE queue_id = ?
        AND action_type = ?
        AND deleted_at IS NULL
      LIMIT 1
    `).get(queueId, actionType) as ActionRouteRow | undefined;

    if (!actionId) {
      if (existingRow) {
        this.db.prepare(`
          UPDATE action_routes
          SET enabled = 0,
              action_id = NULL,
              character_limit = ?,
              updated_at = ?
          WHERE id = ?
        `).run(Math.max(1, Math.trunc(characterLimit)), new Date().toISOString(), existingRow.id);
      }
      return;
    }

    const duplicate = this.db.prepare(`
      SELECT ${routeColumns}
      FROM action_routes
      WHERE action_type = ?
        AND COALESCE(action_id, '') = COALESCE(?, '')
        AND deleted_at IS NULL
      LIMIT 1
    `).get(actionType, actionId) as ActionRouteRow | undefined;

    if (duplicate && duplicate.queueId !== queueId) {
      throw new Error(`Twitch route "${actionId}" is already assigned to another queue.`);
    }

    if (existingRow) {
      const now = new Date().toISOString();
      this.db.prepare(`
        UPDATE action_routes
        SET action_id = ?,
            enabled = ?,
            character_limit = ?,
            updated_at = ?
        WHERE id = ?
      `).run(actionId, enabled ? 1 : 0, Math.max(1, Math.trunc(characterLimit)), now, existingRow.id);
      return;
    }

    this.upsertActionRoute(actionType, actionId, queueId, {
      enabled,
      characterLimit,
    });
  }

  private toTwitchRouteConfig(route: ActionRouteRecord, fallback: QueueTwitchRouteConfig): QueueTwitchRouteConfig {
    return {
      enabled: route.enabled,
      actionId: route.actionId ?? fallback.actionId,
      characterLimit: route.characterLimit,
    };
  }

  markAudioReady(id: string, audioPath: string): QueueItemRecord {
    const now = new Date().toISOString();

    this.db.prepare(`
      UPDATE queue_items
      SET status = 'queued',
          audio_path = ?,
          failed_reason = NULL
      WHERE id = ?
        AND status = 'pending_audio'
        AND deleted_at IS NULL
    `).run(audioPath, id);

    const item = this.getItem(id);
    if (!item) {
      throw new Error(`Queue item ${id} no longer exists after audio generation at ${now}.`);
    }

    return item;
  }

  markFailed(id: string, reason: string): QueueItemRecord | null {
    this.db.prepare(`
      UPDATE queue_items
      SET status = 'failed',
          failed_reason = ?
      WHERE id = ? AND deleted_at IS NULL
    `).run(reason, id);

    return this.getItem(id);
  }

  updateStatus(id: string, status: QueueItemStatus, partial: Partial<Pick<QueueItemRecord, 'vodOffsetMs' | 'playedAt' | 'finishedAt' | 'failedReason'>> = {}): QueueItemRecord | null {
    const current = this.getItem(id);
    if (!current) {
      return null;
    }

    const next = {
      vodOffsetMs: partial.vodOffsetMs ?? current.vodOffsetMs,
      playedAt: partial.playedAt ?? current.playedAt,
      finishedAt: partial.finishedAt ?? current.finishedAt,
      failedReason: partial.failedReason ?? current.failedReason,
      status,
      id,
    };

    this.db.prepare(`
      UPDATE queue_items
      SET status = @status,
          vod_offset_ms = @vodOffsetMs,
          played_at = @playedAt,
          finished_at = @finishedAt,
          failed_reason = @failedReason
      WHERE id = @id AND deleted_at IS NULL
    `).run(next);

    return this.getItem(id);
  }

  softDeleteItem(id: string): void {
    const current = this.getItem(id);
    if (!current) {
      return;
    }

    if (current.status === 'playing') {
      throw new Error('Cannot delete an item while it is playing.');
    }

    this.db.prepare(`
      UPDATE queue_items
      SET deleted_at = ?
      WHERE id = ? AND deleted_at IS NULL
    `).run(new Date().toISOString(), id);
  }

  selectNextItem(): QueueItemRecord | null {
    const queue = this.db.prepare(`
      SELECT ${queueColumns}
      FROM queues q
      WHERE q.deleted_at IS NULL
        AND q.paused = 0
        AND EXISTS (
          SELECT 1
          FROM queue_items i
          WHERE i.queue_id = q.id
            AND i.status = 'queued'
            AND i.deleted_at IS NULL
        )
      ORDER BY q.priority DESC, q.created_at ASC
      LIMIT 1
    `).get() as QueueRow | undefined;

    if (!queue) {
      return null;
    }

    const orderBy = queue.sortMode === 'lifo'
      ? 'requested_at DESC'
      : queue.sortMode === 'priority'
        ? 'priority DESC, requested_at ASC'
        : 'requested_at ASC';

    const row = this.db.prepare(`
      SELECT ${itemColumns}
      FROM queue_items
      WHERE queue_id = ?
        AND status = 'queued'
        AND deleted_at IS NULL
      ORDER BY ${orderBy}
      LIMIT 1
    `).get(queue.id) as QueueItemRow | undefined;

    return row ? toItem(row) : null;
  }

  requeue(id: string): QueueItemRecord {
    const item = this.getItem(id, true);
    if (!item) {
      throw new Error(`Queue item ${id} does not exist.`);
    }

    return this.enqueuePending({
      text: item.text,
      username: item.username,
      source: item.source,
      queueId: item.queueId,
      actionType: item.actionType,
      actionId: item.actionId,
      priority: item.priority,
      bypassFilters: true,
    });
  }
}
