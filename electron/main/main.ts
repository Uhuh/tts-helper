import { app, BrowserWindow, ipcMain, nativeTheme, shell } from 'electron';
import path from 'node:path';
import { openAppDatabase } from './db/database';
import { AppService } from './services/app-service';
import { DiscordWebhookService } from './services/discord-webhook-service';
import { LocalApiServer } from './services/local-api-server';
import { LogService } from './services/log-service';
import { ObsService } from './services/obs-service';
import { OverlayService } from './services/overlay-service';
import { PlaybackService } from './services/playback-service';
import { QueueRepository } from './services/queue-repository';
import { SettingsService } from './services/settings-service';
import { StreamDeckServer } from './services/streamdeck-server';
import { StreamlabsTtsService } from './services/streamlabs-tts-service';
import { TwitchService } from './services/twitch-service';
import type { AppSettings, CreateQueueInput, EnqueueRequest, PartialDeep, TwitchOAuthStartInput, UpdateQueueInput } from '../../src/shared/types';

if (process.platform === 'linux' && app.isPackaged) {
  app.commandLine.appendSwitch('no-sandbox');
  app.commandLine.appendSwitch('disable-dev-shm-usage');
}

const preloadPath = path.join(__dirname, '../preload/preload.js');
nativeTheme.themeSource = 'system';

let mainWindow: BrowserWindow | null = null;
let localApi: LocalApiServer | null = null;
let streamDeck: StreamDeckServer | null = null;
let discordInterval: NodeJS.Timeout | null = null;
let appService: AppService | null = null;
let playbackService: PlaybackService | null = null;
let twitchService: TwitchService | null = null;

function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 920,
    minHeight: 620,
    title: 'TTS Helper',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#0f1419' : '#f5f7fb',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devUrl = process.env.TTS_HELPER_DEV_SERVER_URL;
  if (devUrl) {
    await mainWindow.loadURL(devUrl);
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../../../dist/index.html'));
  }
}

function requireAppService(): AppService {
  if (!appService) {
    throw new Error('App service is not ready.');
  }

  return appService;
}

function requirePlayback(): PlaybackService {
  if (!playbackService) {
    throw new Error('Playback service is not ready.');
  }

  return playbackService;
}

function registerIpcHandlers(queues: QueueRepository, settings: SettingsService, logs: LogService): void {
  ipcMain.handle('app:getState', () => requireAppService().getState());

  ipcMain.handle('queues:list', () => queues.listQueues());
  ipcMain.handle('queues:create', (_event, input: CreateQueueInput) => requireAppService().createQueue(input));
  ipcMain.handle('queues:update', (_event, input: UpdateQueueInput) => requireAppService().updateQueue(input));
  ipcMain.handle('queues:delete', (_event, id: string) => requireAppService().deleteQueue(id));

  ipcMain.handle('items:enqueue', (_event, input: EnqueueRequest) => requireAppService().enqueue(input));
  ipcMain.handle('items:requeue', (_event, id: string) => requireAppService().requeue(id));
  ipcMain.handle('items:delete', (_event, id: string) => requireAppService().deleteItem(id));
  ipcMain.handle('items:playNow', (_event, id: string) => requirePlayback().playItemNow(id));

  ipcMain.handle('playback:pause', () => requirePlayback().pause());
  ipcMain.handle('playback:resume', () => requirePlayback().resume());
  ipcMain.handle('playback:toggle', () => requirePlayback().toggle());
  ipcMain.handle('playback:stopCurrent', () => requirePlayback().stopCurrent());
  ipcMain.handle('playback:skipCurrent', () => requirePlayback().skipCurrent());
  ipcMain.handle('playback:playNext', () => requirePlayback().playNext());
  ipcMain.handle('playback:rendererFinished', (_event, result: { itemId: string }) => requirePlayback().finishItem(result.itemId));
  ipcMain.handle('playback:rendererFailed', (_event, result: { itemId: string; reason?: string }) => {
    return requirePlayback().failItem(result.itemId, result.reason ?? 'Renderer playback failed.');
  });

  ipcMain.handle('settings:get', () => settings.get());
  ipcMain.handle('settings:update', (_event, patch: PartialDeep<AppSettings>) => requireAppService().updateSettings(patch));
  ipcMain.handle('twitch:startOAuth', (_event, input?: TwitchOAuthStartInput) => requireAppService().startTwitchOAuth(input));
  ipcMain.handle('twitch:disconnect', () => requireAppService().disconnectTwitch());
  ipcMain.handle('logs:list', () => logs.list());
}

async function bootstrap(): Promise<void> {
  const userData = app.getPath('userData');
  const db = openAppDatabase(userData);
  const logs = new LogService(db);
  const queues = new QueueRepository(db);
  const settings = new SettingsService(db);
  const overlay = new OverlayService();
  const obs = new ObsService(logs);
  const tts = new StreamlabsTtsService(path.join(userData, 'audio'), logs);
  const discord = new DiscordWebhookService(
    db,
    queues,
    settings,
    logs,
    (item) => twitchService?.findVodUrlForItem(item) ?? Promise.resolve(null),
  );

  playbackService = new PlaybackService(
    queues,
    settings,
    obs,
    overlay,
    discord,
    logs,
    getMainWindow,
    () => appService?.broadcastState(),
  );
  playbackService.recoverOrphanedPlayback();

  appService = new AppService(
    queues,
    settings,
    tts,
    playbackService,
    logs,
    getMainWindow,
  );

  twitchService = new TwitchService(
    db,
    queues,
    settings,
    logs,
    (input) => requireAppService().enqueue(input),
    fetch,
    (url) => shell.openExternal(url),
    async () => {
      appService?.broadcastState();
      await twitchService?.syncFromSettings();
      appService?.broadcastState();
    },
  );
  appService.attachTwitch(twitchService);

  localApi = new LocalApiServer(appService, playbackService, overlay, logs);
  streamDeck = new StreamDeckServer(playbackService, logs);

  registerIpcHandlers(queues, settings, logs);
  await localApi.start();
  streamDeck.start();
  await twitchService.syncFromSettings();
  discordInterval = setInterval(() => void discord.processPendingJobs(), 120_000);
}

app.whenReady().then(async () => {
  await bootstrap();
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
}).catch((error) => {
  console.error(error);
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (discordInterval) {
    clearInterval(discordInterval);
  }

  streamDeck?.stop();
  void localApi?.stop();
  void twitchService?.disconnect();
});
