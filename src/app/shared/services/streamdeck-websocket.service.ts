import { DestroyRef, inject, Injectable } from '@angular/core';
import { AzureSttService } from './azure-stt.service';
import { webSocket } from 'rxjs/webSocket';
import { StreamDeckActions, StreamDeckEvent } from './streamdeck-websocket.interface';
import { LogService } from './logs.service';
import { PlaybackService } from './playback.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class StreamDeckWebSocketService {
  private readonly azureService = inject(AzureSttService);
  private readonly playbackService = inject(PlaybackService);
  private readonly logService = inject(LogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly connection = 'ws://localhost:17448';
  private socket$ = webSocket<StreamDeckEvent>(this.connection);

  constructor() {
    this.connect();

    setTimeout(() => {
      this.socket$.next({ data: 'Hello StreamDeck from TTS Helper.', event: 'none', action: 'none' });
    }, 5000);
  }

  private connect() {
    this.socket$ = webSocket(this.connection);

    this.socket$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.handleEvent(data),
        complete: () => {
          setTimeout(() => this.connect(), 3000);
        },
      });
  }

  private handleEvent(data: StreamDeckEvent) {
    switch (data.action) {
      case StreamDeckActions.STT:
        this.azureService.captureSpeech();
        break;
      case StreamDeckActions.TOGGLE_QUEUE:
        this.playbackService.togglePause();
        break;
      case StreamDeckActions.REFRESH:
        /**
         * Might be rare cases where the user is in a bad state, so allow them to "refresh" the app with a SD event.
         */
        window.location.reload();
        break;
      case StreamDeckActions.SKIP:
        this.playbackService.skipCurrentlyPlaying();
        break;
    }

    this.logService.add(`Received StreamDeck event: ${JSON.stringify(data, undefined, 2)}`, 'info', 'StreamDeckWebSocketService.handleEvent');
  }
}