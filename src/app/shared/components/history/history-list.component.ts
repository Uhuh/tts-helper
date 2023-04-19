import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { HistoryService } from '../../services/history.service';
import { AuditItem } from '../../state/history/history-item.interface';
import { listen } from '@tauri-apps/api/event';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss'],
})
export class HistoryListComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();
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
      this.ref.detectChanges();
    });

    listen('audio-done', (item) => {
      const id = item.payload as number;
      if (this.currentlyPlaying?.id !== id) return;
      this.currentlyPlaying = undefined;
    });
  }

  ngOnInit(): void {
    this.historyService.auditItems$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((items) => {
        this.items = items;
        this.ref.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
