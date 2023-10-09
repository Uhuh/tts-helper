import { Component, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { HistoryListComponent } from "./history-list/history-list.component";
import { LogService } from '../../shared/services/logs.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  standalone: true,
  imports: [ButtonComponent, HistoryListComponent],
})
export class HistoryComponent {
  isPaused = false;

  constructor(private readonly logService: LogService) {}
  
  togglePause() {
    this.isPaused = !this.isPaused;

    invoke('set_tts_paused', {
      paused: this.isPaused,
    }).catch((e) => {
      this.logService.add(`Failed to pause audio.\n${e}`, 'error', 'History.togglePause');
    });
  }
}

export default HistoryComponent;