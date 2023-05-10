import { ChangeDetectorRef, Component } from '@angular/core';
import { HistoryService } from '../../services/history.service';
import { AuditItem } from '../../state/history/history-item.interface';
import { listen } from '@tauri-apps/api/event';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HistoryItemComponent } from './history-item/history-item.component';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss'],
  standalone: true,
  imports: [NgIf, HistoryItemComponent, NgFor],
})
export class HistoryListComponent {
  items: AuditItem[] = [];
  currentlyPlaying?: AuditItem;

  constructor(
    private readonly historyService: HistoryService,
    private readonly ref: ChangeDetectorRef
  ) {
    listen('audio-start', (item) => {
      const id = item.payload as number;
      this.currentlyPlaying = this.items.find((i) => i.id === id);
      // It will absolutely not display in time without this.
      this.ref.markForCheck();
    });

    listen('audio-done', (item) => {
      const id = item.payload as number;
      if (this.currentlyPlaying?.id !== id) return;
      this.currentlyPlaying = undefined;
    });

    this.historyService.auditItems$
      .pipe(takeUntilDestroyed())
      .subscribe((items) => {
        this.items = items;
        this.ref.markForCheck();
      });
  }
}
