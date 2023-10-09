import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HistoryService } from 'src/app/shared/services/history.service';
import { DatePipe, NgClass } from '@angular/common';
import { AuditItem, AuditState, } from '../../../shared/state/history/history.feature';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { PlaybackService } from 'src/app/shared/services/playback.service';
import { LogService } from '../../../shared/services/logs.service';

@Component({
  selector: 'app-history-item',
  templateUrl: './history-item.component.html',
  styleUrls: ['./history-item.component.scss'],
  standalone: true,
  imports: [ButtonComponent, NgClass, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryItemComponent {
  @Input({ required: true }) audit!: AuditItem;
  @Output() itemSkipped = new EventEmitter<number>();

  constructor(
    private readonly historyService: HistoryService,
    private readonly playbackService: PlaybackService,
    private readonly logService: LogService,
    private readonly snackbar: MatSnackBar
  ) {}

  get svg() {
    return `assets/${this.audit.source.toLowerCase()}.svg`;
  }

  get action() {
    switch (this.audit.state) {
      case AuditState.playing:
        return 'Skip';
      case AuditState.skipped:
        return 'Skipped';
      case AuditState.finished:
      default:
        return 'Finished';
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
    this.logService.add(`Requeueing audio: ${JSON.stringify(this.audit)}`, 'info', 'HistoryItemComponent.requeue');
    this.historyService.removeHistory(this.audit.id);

    this.historyService.requeue(this.audit);
  }

  skip() {
    this.playbackService
      .setAudioState({ id: this.audit.id, skipped: true })
      .then(() => {
          this.itemSkipped.emit(this.audit.id);
          this.historyService.updateHistory(this.audit.id, AuditState.skipped);
        }
      )
      .catch((e) => {
        this.logService.add(`Failed to skip audio. Most likely already finished / skipped.\n${JSON.stringify(e, undefined, 2)}`, 'error', 'HistoryItem.skip');

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
