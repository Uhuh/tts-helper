import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { PlaybackService } from './playback.service';
import { AudioService } from './audio.service';
import { webSocket } from 'rxjs/webSocket';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LogService } from './logs.service';
import { first, retry, tap } from 'rxjs';
import { AudioItem } from '../state/audio/audio.feature';
import type { PngTtsConfig } from '../../pages/png-tts/assets/png-tts-generator';

type ObsEvent = {
  id: string;
  event:
    | 'add-captions'
    | 'remove-captions'
    | 'audio-added'
    | 'audio-started'
    | 'audio-finished'
    | 'audio-skipped'
    | 'audio-queue'
    | 'chat-message'
    | 'png-tts-select-model'
    | 'png-tts-hello'
    | 'png-tts-request-hello';
  text?: string;
  audioId?: number;
  chatMessageId?: string;
  queue?: AudioItem[];
  modelIndex?: number;
  modelCount?: number;
  modelNames?: string[];
  config?: PngTtsConfig;
  message?: {
    chatMessageId: string;
    username: string;
    text: string;
    source: string;
    isTTS: boolean;
  };
};

@Injectable()
export class ObsWebSocketService {
  private readonly playbackService = inject(PlaybackService);
  private readonly audioService = inject(AudioService);
  private readonly logService = inject(LogService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly audioItems$ = this.audioService.audioItems$;
  private readonly connection = 'ws://localhost:37891';
  private socket$ = this.createSocket();

  readonly pngTtsConnected = signal(false);
  readonly pngTtsModelCount = signal<number | null>(null);
  readonly pngTtsModelNames = signal<string[]>([]);
  readonly pngTtsSourceConfig = signal<PngTtsConfig | null>(null);

  constructor() {
    this.playbackService.audioStarted$
      .pipe(
        takeUntilDestroyed(),
        tap(id => {
          this.sendCaptions(id);

          this.audioItems$
            .pipe(first())
            .subscribe(items => {
              const audio = items.find(a => a.id === id);
              this.sendAudioStarted(id, audio?.chatMessageId);
            });
        }),
      )
      .subscribe();

    this.playbackService.audioFinished$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.removeCaptions();
        this.sendAudioFinished();
      });

    this.playbackService.audioSkipped$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.removeCaptions();
        this.sendAudioSkipped();
      });

    this.audioItems$
      .pipe(takeUntilDestroyed())
      .subscribe(items => {
        this.sendAudioQueue(items);
      });

    this.connect();

    setTimeout(() => {
      this.socket$.next({ data: 'Hello OBS from TTS Helper.' });
    }, 5000);
  }

  private createSocket() {
    return webSocket<ObsEvent | { data: string }>({
      url: this.connection,
      openObserver: {
        next: () => this.socket$.next({
          id: 'tts-helper',
          event: 'png-tts-request-hello',
        }),
      },
    });
  }

  private connect() {
    this.socket$ = this.createSocket();

    this.socket$
      .pipe(
        tap({ error: () => this.resetPngTtsState() }),
        retry({
          delay: 5000,
        }),
      )
      .subscribe({
        next: (msg) => this.handleIncoming(msg),
        complete: () => {
          this.resetPngTtsState();
          setTimeout(() => this.connect(), 3000);
        },
      });
  }

  private resetPngTtsState() {
    this.pngTtsConnected.set(false);
    this.pngTtsModelCount.set(null);
    this.pngTtsModelNames.set([]);
    this.pngTtsSourceConfig.set(null);
  }

  private handleIncoming(event: ObsEvent | { data: string }) {
    if (!event || typeof event !== 'object' || !('event' in event)) {
      return;
    }

    switch (event.event) {
      case 'png-tts-hello':
        this.pngTtsConnected.set(true);

        if (typeof event.modelCount === 'number' && event.modelCount >= 0) {
          this.pngTtsModelCount.set(event.modelCount);
        }

        if (Array.isArray(event.modelNames)) {
          this.pngTtsModelNames.set(event.modelNames.filter(name => typeof name === 'string'));
        }

        if (event.config && typeof event.config === 'object') {
          this.pngTtsSourceConfig.set(event.config);
        }
        break;
    }
  }

  sendCaptions(id: number) {
    return this.audioItems$
      .pipe(
        first(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(audioItems => {
        const item = audioItems.find(i => i.id === id);

        if (!item) {
          return this.logService.add(`Can't find audio item for OBS captions.`, 'error', 'ObsWebSocketService.audioStarted$');
        }

        const event: ObsEvent = {
          id: 'tts-helper',
          event: 'add-captions',
          text: item.text,
        };

        this.socket$.next(event);
      });
  }

  removeCaptions() {
    const event: ObsEvent = {
      id: 'tts-helper',
      event: 'remove-captions',
    };

    this.socket$.next(event);
  }

  sendAudioStarted(audioId: number, chatMessageId?: string) {
    const event: ObsEvent = {
      id: 'on-screen-chat',
      event: 'audio-started',
      audioId,
      chatMessageId,
    };

    this.socket$.next(event);
  }

  sendAudioFinished() {
    const event: ObsEvent = {
      id: 'on-screen-chat',
      event: 'audio-finished',
    };

    this.socket$.next(event);
  }

  sendAudioSkipped() {
    const event: ObsEvent = {
      id: 'on-screen-chat',
      event: 'audio-skipped',
    };

    this.socket$.next(event);
  }

  sendAudioQueue(queue: AudioItem[]) {
    const event: ObsEvent = {
      id: 'on-screen-chat',
      event: 'audio-queue',
      queue,
    };

    this.socket$.next(event);
  }

  sendSelectPngModel(modelIndex: number) {
    const event: ObsEvent = {
      id: 'png-tts',
      event: 'png-tts-select-model',
      modelIndex,
    };

    this.socket$.next(event);
  }

  sendChatMessage(username: string, text: string, source: string, isTTS: boolean, chatMessageId?: string) {
    const event: ObsEvent = {
      id: 'on-screen-chat',
      event: 'chat-message',
      message: {
        chatMessageId: chatMessageId || `${Date.now()}-${Math.random()}`,
        username,
        text,
        source,
        isTTS,
      },
    };

    this.socket$.next(event);
  }
}