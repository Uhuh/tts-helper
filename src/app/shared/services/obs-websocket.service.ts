import { DestroyRef, inject, Injectable } from '@angular/core';
import { PlaybackService } from './playback.service';
import { AudioService } from './audio.service';
import { webSocket } from 'rxjs/webSocket';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LogService } from './logs.service';
import { first, retry, tap } from 'rxjs';

type ObsEvent = {
  id: string;
  event: 'add-captions' | 'remove-captions';
  text?: string;
};

@Injectable()
export class ObsWebSocketService {
  private readonly playbackService = inject(PlaybackService);
  private readonly audioService = inject(AudioService);
  private readonly logService = inject(LogService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly audioItems$ = this.audioService.audioItems$;
  private readonly connection = 'ws://localhost:37891';
  private socket$ = webSocket(this.connection);

  constructor() {
    this.playbackService.audioStarted$
      .pipe(
        takeUntilDestroyed(),
        tap(id => this.sendCaptions(id)),
      )
      .subscribe();

    this.playbackService.audioFinished$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.removeCaptions());

    this.playbackService.audioSkipped$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.removeCaptions());

    this.connect();

    setTimeout(() => {
      this.socket$.next({ data: 'Hello OBS from TTS Helper.' });
    }, 5000);
  }

  private connect() {
    this.socket$ = webSocket(this.connection);

    this.socket$
      .pipe(retry({
        delay: 5000,
      }))
      .subscribe({
        complete: () => {
          setTimeout(() => this.connect(), 3000);
        },
      });
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
}