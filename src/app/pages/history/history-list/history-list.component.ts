import { ChangeDetectorRef, Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIf, NgFor } from '@angular/common';
import { AuditItem } from "../../../shared/state/history/history-item.interface";
import { HistoryService } from "../../../shared/services/history.service";
import { PlaybackService } from "../../../shared/services/playback.service";
import { HistoryItemComponent } from "../history-item/history-item.component";

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
