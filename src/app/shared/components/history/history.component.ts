import { Component, Input } from '@angular/core';
import { AuditItem } from './history-item/history-item.interface';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent {
  @Input() items: AuditItem[] = [];
}
