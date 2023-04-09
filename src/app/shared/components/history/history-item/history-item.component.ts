import { Component, Input } from '@angular/core';
import { AuditItem } from './history-item.interface';

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
}
