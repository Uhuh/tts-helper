import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LogService } from '../../shared/services/logs.service';
import { PlaybackService } from '../../shared/services/playback.service';
import { AsyncPipe } from '@angular/common';
import { AudioListComponent } from '../../shared/components/audio-list/audio-list.component';
import { AudioStatus } from '../../shared/state/audio/audio.feature';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
    imports: [ButtonComponent, AudioListComponent, AsyncPipe]
})
export class HistoryComponent {
  protected readonly AudioStatus = AudioStatus;
  private readonly logService = inject(LogService);
  private readonly playbackService = inject(PlaybackService);
  readonly isPaused$ = this.playbackService.isPaused$;

  togglePause() {
    this.playbackService.togglePause()
      .catch((e) => {
        this.logService.add(`Failed to pause audio.\n${e}`, 'error', 'History.togglePause');
      });
  }
}

export default HistoryComponent;