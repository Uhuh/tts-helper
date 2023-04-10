import { Component, Input, OnDestroy } from '@angular/core';
import {
  AuditItem,
  AuditState,
} from '../../../state/history/history-item.interface';
import { invoke } from '@tauri-apps/api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HistoryService } from 'src/app/shared/services/history.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-history-item',
  templateUrl: './history-item.component.html',
  styleUrls: ['./history-item.component.scss'],
})
export class HistoryItemComponent implements OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  @Input() audit!: AuditItem;

  readonly AuditState = AuditState;

  constructor(
    private readonly historyService: HistoryService,
    private readonly snackbar: MatSnackBar
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  get svg() {
    return `assets/${this.audit.source.toLowerCase()}.svg`;
  }

  get action() {
    switch (this.audit.state) {
      case AuditState.finished:
        return 'Finished';
      case AuditState.playing:
        return 'Skip';
      case AuditState.skipped:
        return 'Skipped';
    }
  }

  get finished() {
    return this.audit.state === AuditState.finished;
  }

  get skipped() {
    return this.audit.state === AuditState.skipped;
  }

  skip() {
    invoke('set_audio_state', {
      state: {
        id: this.audit.id,
        skip: true,
      },
    })
      .then(() =>
        this.historyService.updateHistory(this.audit.id, AuditState.skipped)
      )
      .catch((e) => {
        console.error(`Failed to skip audio.`, e);

        this.snackbar.open(
          'Oops! We encountered an error trying to skip that.',
          'Dismiss',
          {
            panelClass: 'notification-error',
          }
        );
      });
  }
}
