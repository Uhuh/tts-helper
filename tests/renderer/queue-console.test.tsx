import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { QueueConsole } from '../../src/renderer/components/QueueConsole';
import { DEFAULT_QUEUE_TWITCH_ROUTES } from '../../src/shared/types';
import type { AppState, IpcApi } from '../../src/shared/types';

const state: AppState = {
  playback: {
    paused: false,
    currentItem: null,
  },
  settings: {
    tts: {
      voice: 'Ivy',
      language: 'US English',
      defaultCharacterLimit: 300,
      monitorAudioEnabled: true,
      monitorOutputDeviceId: 'default',
    },
    obs: {
      enabled: false,
      url: 'ws://127.0.0.1:4455',
      password: '',
      browserSourceCaptionsEnabled: true,
      browserSourceAudioEnabled: false,
    },
    discord: {
      webhookUrl: '',
    },
    twitch: {
      enabled: false,
      clientId: 'client',
      token: '',
      refreshToken: '',
      tokenExpiresAt: null,
      channelId: '',
      channelName: '',
      redeemEnabled: true,
      redeemId: '',
      redeemCharacterLimit: 300,
      chatEnabled: false,
      chatCommand: '!say',
      chatCharacterLimit: 300,
    },
  },
  logs: [],
  queues: [
    {
      id: 'default',
      name: 'Default',
      priority: 0,
      sortMode: 'fifo',
      paused: false,
      createdAt: '2026-05-17T00:00:00.000Z',
      updatedAt: '2026-05-17T00:00:00.000Z',
      deletedAt: null,
      twitchRoutes: {
        chat: { ...DEFAULT_QUEUE_TWITCH_ROUTES.chat },
        redeem: { ...DEFAULT_QUEUE_TWITCH_ROUTES.redeem },
      },
      items: [
        {
          id: 'item-1',
          queueId: 'default',
          actionType: 'manual',
          actionId: null,
          source: 'manual',
          username: 'viewer',
          text: 'hello there',
          status: 'queued',
          priority: 0,
          requestedAt: '2026-05-17T00:00:00.000Z',
          audioPath: '/tmp/item-1.mp3',
          audioUrl: 'file:///tmp/item-1.mp3',
          vodOffsetMs: null,
          playedAt: null,
          finishedAt: null,
          failedReason: null,
          deletedAt: null,
        },
      ],
    },
    {
      id: 'vip',
      name: 'VIP',
      priority: 10,
      sortMode: 'priority',
      paused: false,
      createdAt: '2026-05-17T00:00:00.000Z',
      updatedAt: '2026-05-17T00:00:00.000Z',
      deletedAt: null,
      twitchRoutes: {
        chat: { enabled: true, actionId: '!vip', characterLimit: 120 },
        redeem: { enabled: true, actionId: 'vip-reward', characterLimit: 240 },
      },
      items: [],
    },
  ],
};

describe('QueueConsole', () => {
  it('renders queue summaries and hides item history until requested', async () => {
    const user = userEvent.setup();
    window.ttsHelper = {
      playNext: vi.fn(),
      togglePlayback: vi.fn(),
      skipCurrent: vi.fn(),
      stopCurrent: vi.fn(),
      createQueue: vi.fn(),
      enqueueItem: vi.fn(),
      updateQueue: vi.fn(),
      reorderQueues: vi.fn(),
      deleteQueue: vi.fn(),
      playItemNow: vi.fn(),
      requeueItem: vi.fn(),
      deleteItem: vi.fn(),
    } as unknown as IpcApi;

    render(<QueueConsole state={state} refresh={vi.fn()} />);

    expect(screen.getByTestId('queue-console')).toBeInTheDocument();
    expect(screen.getByText('Queue order')).toBeInTheDocument();
    expect(screen.getAllByText('Default')).not.toHaveLength(0);
    expect(screen.getAllByText('VIP')).not.toHaveLength(0);
    expect(screen.getAllByText('Pending')).toHaveLength(4);
    expect(screen.queryByText('hello there')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Show Default history'));

    expect(screen.getByText('hello there')).toBeInTheDocument();

    await user.click(screen.getByLabelText('VIP settings'));

    expect(screen.queryByLabelText('VIP priority')).not.toBeInTheDocument();
  });
});
