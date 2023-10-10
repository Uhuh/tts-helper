import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { HistoryListComponent } from './history-list/history-list.component';
import { LogService } from '../../shared/services/logs.service';
import { PlaybackService } from '../../shared/services/playback.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  standalone: true,
  imports: [ButtonComponent, HistoryListComponent],
})
export class HistoryComponent {
  isPaused = false;

  constructor(private readonly logService: LogService, private readonly playbackService: PlaybackService) {
    this.playbackService.playbackState$
      .pipe(takeUntilDestroyed())
      .subscribe(state => this.isPaused = !!state?.paused);
  }
  
  togglePause() {
    this.playbackService.setPlaybackState({
      paused: !this.isPaused,
    }).then(console.log).catch((e) => {
      this.logService.add(`Failed to pause audio.\n${e}`, 'error', 'History.togglePause');
    });
  }
}

export default HistoryComponent;