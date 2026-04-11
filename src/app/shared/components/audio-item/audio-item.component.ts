import { ApplicationRef, ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AudioService } from 'src/app/shared/services/audio.service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { PlaybackService } from 'src/app/shared/services/playback.service';
import { AudioItem, AudioStatus } from '../../state/audio/audio.feature';
import { LogService } from '../../services/logs.service';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-audio-item',
  templateUrl: './audio-item.component.html',
  styleUrls: ['./audio-item.component.scss'],
  imports: [ButtonComponent, DatePipe, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioItemComponent {
  private readonly audioService = inject(AudioService);
  private readonly playbackService = inject(PlaybackService);
  private readonly ref = inject(ApplicationRef);
  private readonly logService = inject(LogService);
  private readonly snackbar = inject(MatSnackBar);

  @Input({ required: true }) audio!: AudioItem;
  @Output() itemSkipped = new EventEmitter<number>();

  readonly AudioState = AudioStatus;
  readonly isPaused$ = this.playbackService.isPaused$;

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

  get queued() {
    return this.audio.state === AudioStatus.queued;
  }

  requeue() {
    this.logService.add(`Requeueing audio: ${JSON.stringify(this.audio)}`, 'info', 'AudioItemComponent.requeue');
    this.audioService.removeAudio(this.audio.id);

    this.audioService.requeue(this.audio);
  }

  manualPlay() {
    this.logService.add(`Manually playing audio: ${JSON.stringify(this.audio)}`, 'info', 'AudioItemComponent.manualPlay');
    this.audioService.removeAudio(this.audio.id);

    this.playbackService
      .setAudioState({ id: this.audio.id, skipped: true })
      .catch(() => undefined);

    this.audioService.playTts(
      this.audio.text,
      this.audio.username,
      this.audio.source,
      1000,
      true,
      true,
    );
  }

  skip() {
    this.playbackService
      .setAudioState({ id: this.audio.id, skipped: true })
      .then(() => {
        this.audioService.updateAudio(this.audio.id, AudioStatus.skipped);
        this.playbackService.audioSkipped$.next();
        this.ref.tick();
      })
      .catch((e) => {
        this.logService.add(`Failed to skip audio. Most likely already finished / skipped.\n${JSON.stringify(e, undefined, 2)}`, 'error', 'HistoryItem.skip');

        this.snackbar.open(
          'Oops! We encountered an error trying to skip that.',
          'Dismiss',
          {
            panelClass: 'notification-error',
          },
        );
      });
  }
}
