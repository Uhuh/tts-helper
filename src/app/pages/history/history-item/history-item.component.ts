import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AudioService } from 'src/app/shared/services/audio.service';
import { DatePipe, NgClass } from '@angular/common';
import { AudioItem, AudioStatus, } from '../../../shared/state/audio/audio.feature';
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
  @Input({ required: true }) audio!: AudioItem;
  @Output() itemSkipped = new EventEmitter<number>();

  readonly AudioState = AudioStatus;
  
  constructor(
    private readonly audioService: AudioService,
    private readonly playbackService: PlaybackService,
    private readonly logService: LogService,
    private readonly snackbar: MatSnackBar
  ) {}

  get svg() {
    return `assets/${this.audio.source.toLowerCase()}.svg`;
  }

  get action() {
    switch (this.audio.state) {
      case AudioStatus.queued:
      case AudioStatus.playing:
        return 'Skip';
      case AudioStatus.skipped:
        return 'Skipped';
      case AudioStatus.finished:
      default:
        return 'Finished';
    }
  }

  get playing() {
    return this.audio.state === AudioStatus.playing;
  }

  get finished() {
    return this.audio.state === AudioStatus.finished;
  }

  get skipped() {
    return this.audio.state === AudioStatus.skipped;
  }

  requeue() {
    this.logService.add(`Requeueing audio: ${JSON.stringify(this.audio)}`, 'info', 'HistoryItemComponent.requeue');
    this.audioService.removeAudio(this.audio.id);

    this.audioService.requeue(this.audio);
  }

  skip() {
    this.playbackService
      .setAudioState({ id: this.audio.id, skipped: true })
      .then(() => this.audioService.updateAudio(this.audio.id, AudioStatus.skipped))
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
