import { Component, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { HistoryListComponent } from "./history-list/history-list.component";

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  standalone: true,
  imports: [ButtonComponent, HistoryListComponent],
})
export class HistoryComponent {
  isPaused = signal(false);

  togglePause() {
    this.isPaused.set(!this.isPaused());

    invoke('set_tts_paused', {
      paused: this.isPaused(),
    }).catch(() => {
      console.error('Failed to pause audio');
    });
  }
}
