import { ChangeDetectorRef, Component } from '@angular/core';
import { HistoryService } from '../../services/history.service';
import { AuditItem } from '../../state/history/history-item.interface';
import { listen } from '@tauri-apps/api/event';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HistoryItemComponent } from './history-item/history-item.component';
import { NgIf, NgFor } from '@angular/common';
import { PlaybackService } from '../../services/playback.service';

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
    private readonly playbackService: PlaybackService,
    private readonly historyService: HistoryService,
    private readonly ref: ChangeDetectorRef
  ) {
    this.playbackService.audioStarted$
      .pipe(takeUntilDestroyed())
      .subscribe((id) => {
        this.currentlyPlaying = this.items.find((i) => i.id === id);
        // It will absolutely not display in time without this.
        this.ref.markForCheck();
      });

    this.playbackService.audioFinished$
      .pipe(takeUntilDestroyed())
      .subscribe((id) => {
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
