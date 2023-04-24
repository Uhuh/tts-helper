import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAuditItems } from '../state/history/history.selectors';
import {
  AuditItem,
  AuditSource,
  AuditState,
} from '../state/history/history-item.interface';
import {
  addHistory,
  updateHistoryStatus,
} from '../state/history/history.actions';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigService } from './config.service';
import { Subject, takeUntil } from 'rxjs';
import { VoiceSettings } from '../state/config/config.interface';

@Injectable()
export class HistoryService implements OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  public readonly auditItems$ = this.store.select(selectAuditItems);
  bannedWords: string[] = [];
  voiceSettings!: VoiceSettings;

  constructor(
    private readonly store: Store,
    private readonly configService: ConfigService,
    private readonly snackbar: MatSnackBar
  ) {
    this.configService.bannedWords$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((bannedWords) => {
        this.bannedWords = bannedWords;
      });

    this.configService.voiceSettings$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((voiceSettings) => (this.voiceSettings = voiceSettings));

    listen('audio-done', (item) => {
      this.store.dispatch(
        updateHistoryStatus({
          id: item.payload as number,
          auditState: AuditState.finished,
        })
      );
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  requeue(audit: AuditItem) {
    /**
     * @TODO - Determine if not having a character limit on requeue is good or bad.
     */
    this.playTts(audit.text, audit.username, audit.source, 1000, audit.id);
  }

  playTts(
    text: string,
    username: string,
    source: AuditSource,
    charLimit: number,
    auditId?: number
  ) {
    if (this.bannedWords.find((w) => text.toLowerCase().includes(w))) {
      return;
    }

    // Trim played audio down, but keep full message incase stream wants to requeue it.
    const audioText = text.substring(0, charLimit);

    invoke('play_tts', {
      /**
       * @TODO - Setup state for handling selected TTS options
       */
      request: {
        id: auditId,
        url: this.voiceSettings.url,
        params: [
          ['voice', this.voiceSettings.voice],
          ['text', audioText],
        ],
      },
    })
      .then((id) => {
        if (typeof id != 'number') {
          throw new Error(`Unexpected response type: ${typeof id}`);
        }

        if (auditId !== undefined) {
          return;
        }

        this.addHistory({
          id,
          createdAt: new Date(),
          source,
          text: text ?? '[No TTS text found]',
          username,
          state: AuditState.playing,
        });
      })
      .catch((e) => {
        console.error(`Error invoking play_tts: ${e}`);

        this.snackbar.open(
          'Oops! We encountered an error while playing that.',
          'Dismiss',
          {
            panelClass: 'notification-error',
          }
        );
      });
  }

  addHistory(audit: AuditItem) {
    return this.store.dispatch(addHistory({ audit }));
  }

  updateHistory(id: number, auditState: AuditState) {
    return this.store.dispatch(updateHistoryStatus({ id, auditState }));
  }
}
