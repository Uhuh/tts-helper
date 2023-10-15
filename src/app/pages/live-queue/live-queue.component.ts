import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioListComponent } from '../../shared/components/audio-list/audio-list.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LogService } from '../../shared/services/logs.service';
import { PlaybackService } from '../../shared/services/playback.service';
import { AudioStatus } from '../../shared/state/audio/audio.feature';

@Component({
  selector: 'app-live-queue',
  standalone: true,
  imports: [CommonModule, AudioListComponent, ButtonComponent],
  templateUrl: './live-queue.component.html',
  styleUrls: ['./live-queue.component.scss']
})
export class LiveQueueComponent {
  protected readonly AudioStatus = AudioStatus;
  isPaused$ = this.playbackService.isPaused$;

  constructor(private readonly logService: LogService, private readonly playbackService: PlaybackService) {}

  togglePause() {
    this.playbackService.togglePause()
      .catch((e) => {
        this.logService.add(`Failed to pause audio.\n${e}`, 'error', 'LiveQueueComponent.togglePause');
      });
  }
}

export default LiveQueueComponent