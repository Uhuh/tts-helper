import { inject, Injectable } from '@angular/core';
import { PlaybackService } from './playback.service';
import { AudioService } from './audio.service';
import { webSocket } from 'rxjs/webSocket';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AudioItem } from '../state/audio/audio.feature';
import { LogService } from './logs.service';
import { retry } from 'rxjs';

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

  private readonly connection = 'ws://localhost:37891';
  private socket$ = webSocket(this.connection);
  private audioItems: AudioItem[] = [];

  constructor() {
    this.audioService.audioItems$
      .pipe(takeUntilDestroyed())
      .subscribe(audioItems => this.audioItems = audioItems);

    this.playbackService.audioStarted$
      .pipe(takeUntilDestroyed())
      .subscribe(id => this.sendCaptions(id));

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

  private sendCaptions(id: number) {
    const item = this.audioItems.find(i => i.id === id);

    if (!item) {
      return this.logService.add(`Can't find audio item for OBS captions.`, 'error', 'ObsWebSocketService.audioStarted$');
    }

    const event: ObsEvent = {
      id: 'tts-helper',
      event: 'add-captions',
      text: item.text,
    };

    this.socket$.next(event);
  }

  private removeCaptions() {
    const event: ObsEvent = {
      id: 'tts-helper',
      event: 'remove-captions',
    };

    this.socket$.next(event);
  }
}