import { Component, Input } from '@angular/core';
import { AuditItem } from './history-item.interface';
import { invoke } from '@tauri-apps/api';

@Component({
  selector: 'app-history-item',
  templateUrl: './history-item.component.html',
  styleUrls: ['./history-item.component.scss'],
})
export class HistoryItemComponent {
  @Input() audit!: AuditItem;

  get svg() {
    return `assets/${this.audit.source.toLowerCase()}.svg`;
  }

  skip() {
    invoke('set_audio_state', {
      state: {
        id: this.audit.id,
        skip: true,
      }
    }).then(() => this.audit.skipped = true);
  }
}
