import { contextBridge, ipcRenderer } from 'electron';
import type {
  AppSettings,
  AppState,
  CreateQueueInput,
  EnqueueRequest,
  IpcApi,
  PartialDeep,
  PlaybackControlPayload,
  PlaybackItemPayload,
  ReorderQueuesInput,
  RendererPlaybackResult,
  TwitchOAuthStartInput,
  UpdateQueueInput,
} from '../../src/shared/types';

function on<T>(channel: string, callback: (payload: T) => void): () => void {
  const listener = (_event: Electron.IpcRendererEvent, payload: T) => callback(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

const api: IpcApi = {
  getAppState: () => ipcRenderer.invoke('app:getState'),
  listQueues: () => ipcRenderer.invoke('queues:list'),
  createQueue: (input: CreateQueueInput) => ipcRenderer.invoke('queues:create', input),
  updateQueue: (input: UpdateQueueInput) => ipcRenderer.invoke('queues:update', input),
  reorderQueues: (input: ReorderQueuesInput) => ipcRenderer.invoke('queues:reorder', input),
  deleteQueue: (id: string) => ipcRenderer.invoke('queues:delete', id),
  enqueueItem: (input: EnqueueRequest) => ipcRenderer.invoke('items:enqueue', input),
  requeueItem: (id: string) => ipcRenderer.invoke('items:requeue', id),
  deleteItem: (id: string) => ipcRenderer.invoke('items:delete', id),
  playItemNow: (id: string) => ipcRenderer.invoke('items:playNow', id),
  pausePlayback: () => ipcRenderer.invoke('playback:pause'),
  resumePlayback: () => ipcRenderer.invoke('playback:resume'),
  togglePlayback: () => ipcRenderer.invoke('playback:toggle'),
  stopCurrent: () => ipcRenderer.invoke('playback:stopCurrent'),
  skipCurrent: () => ipcRenderer.invoke('playback:skipCurrent'),
  playNext: () => ipcRenderer.invoke('playback:playNext'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: PartialDeep<AppSettings>) => ipcRenderer.invoke('settings:update', settings),
  startTwitchOAuth: (input?: TwitchOAuthStartInput) => ipcRenderer.invoke('twitch:startOAuth', input),
  disconnectTwitch: () => ipcRenderer.invoke('twitch:disconnect'),
  getLogs: () => ipcRenderer.invoke('logs:list'),
  rendererFinished: (result: RendererPlaybackResult) => ipcRenderer.invoke('playback:rendererFinished', result),
  rendererFailed: (result: RendererPlaybackResult) => ipcRenderer.invoke('playback:rendererFailed', result),
  onPlaybackItem: (callback: (payload: PlaybackItemPayload) => void) => on('playback:item', callback),
  onPlaybackControl: (callback: (payload: PlaybackControlPayload) => void) => on('playback:control', callback),
  onStateChanged: (callback: (state: AppState) => void) => on('state:changed', callback),
};

contextBridge.exposeInMainWorld('ttsHelper', api);
