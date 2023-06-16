import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HistoryService } from 'src/app/shared/services/history.service';
import { NgClass, DatePipe } from '@angular/common';
import {
  AuditItem,
  AuditState,
} from '../../../shared/state/history/history-item.interface';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { PlaybackService } from 'src/app/shared/services/playback.service';

@Component({
  selector: 'app-history-item',
  templateUrl: './history-item.component.html',
  styleUrls: ['./history-item.component.scss'],
  standalone: true,
  imports: [ButtonComponent, NgClass, DatePipe],
})
export class HistoryItemComponent {
  @Input() audit!: AuditItem;

  constructor(
    private readonly historyService: HistoryService,
    private readonly playbackService: PlaybackService,
    private readonly snackbar: MatSnackBar
  ) {}

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

  get playing() {
    return this.audit.state === AuditState.playing;
  }

  get finished() {
    return this.audit.state === AuditState.finished;
  }

  get skipped() {
    return this.audit.state === AuditState.skipped;
  }

  requeue() {
    this.historyService.removeHistory(this.audit.id);

    this.historyService.requeue(this.audit);
  }

  skip() {
    this.playbackService
      .setAudioState({ id: this.audit.id, skipped: true })
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
