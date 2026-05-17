import { WebSocketServer } from 'ws';
import type { LogService } from './log-service';
import type { PlaybackService } from './playback-service';

export enum StreamDeckAction {
  STT = 'com.tts-helper.tts-helper.stt',
  TOGGLE_QUEUE = 'com.tts-helper.tts-helper.toggle-queue',
  REFRESH = 'com.tts-helper.tts-helper.refresh',
  SKIP = 'com.tts-helper.tts-helper.skip',
  PLAY_NOW = 'com.tts-helper.tts-helper.play-now',
  STOP_CURRENT = 'com.tts-helper.tts-helper.stop-current',
}

interface StreamDeckMessage {
  action?: string;
  event?: string;
  data?: unknown;
}

export class StreamDeckServer {
  private server: WebSocketServer | null = null;

  constructor(
    private readonly playback: PlaybackService,
    private readonly logs: LogService,
    private readonly port = 17448,
  ) {}

  start(): void {
    if (this.server) {
      return;
    }

    this.server = new WebSocketServer({
      host: '127.0.0.1',
      port: this.port,
    });

    this.server.on('connection', (socket) => {
      socket.send(JSON.stringify({ event: 'connected', data: 'TTS Helper StreamDeck bridge ready.' }));
      socket.on('message', (raw) => {
        void this.handleMessage(raw.toString()).catch((error) => {
          this.logs.add('error', 'StreamDeckServer.handleMessage', error instanceof Error ? error.message : JSON.stringify(error));
        });
      });
    });

    this.logs.add('info', 'StreamDeckServer.start', `Listening on ws://127.0.0.1:${this.port}.`);
  }

  stop(): void {
    this.server?.close();
    this.server = null;
  }

  private async handleMessage(raw: string): Promise<void> {
    const message = JSON.parse(raw) as StreamDeckMessage;

    switch (message.action) {
      case StreamDeckAction.TOGGLE_QUEUE:
        this.playback.toggle();
        break;
      case StreamDeckAction.SKIP:
        await this.playback.skipCurrent();
        break;
      case StreamDeckAction.PLAY_NOW:
        await this.playback.playNext();
        break;
      case StreamDeckAction.STOP_CURRENT:
        this.playback.stopCurrent();
        break;
      case StreamDeckAction.REFRESH:
        this.logs.add('info', 'StreamDeckServer.handleMessage', 'Refresh requested by StreamDeck.');
        break;
      case StreamDeckAction.STT:
        this.logs.add('warn', 'StreamDeckServer.handleMessage', 'STT action is unsupported in the simplified app.');
        break;
      default:
        this.logs.add('warn', 'StreamDeckServer.handleMessage', `Unknown StreamDeck action: ${message.action ?? 'none'}.`);
    }
  }
}
