import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { HistoryListComponent } from './history-list/history-list.component';
import { LogService } from '../../shared/services/logs.service';
import { PlaybackService } from '../../shared/services/playback.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  standalone: true,
  imports: [ButtonComponent, HistoryListComponent, AsyncPipe],
})
export class HistoryComponent {
  isPaused$ = this.playbackService.isPaused$;

  constructor(private readonly logService: LogService, private readonly playbackService: PlaybackService) {}

  togglePause() {
    this.playbackService.togglePause()
      .catch((e) => {
        this.logService.add(`Failed to pause audio.\n${e}`, 'error', 'History.togglePause');
      });
  }
}

export default HistoryComponent;