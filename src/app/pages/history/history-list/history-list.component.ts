import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIf, NgFor } from '@angular/common';
import { HistoryService } from '../../../shared/services/history.service';
import { PlaybackService } from '../../../shared/services/playback.service';
import { HistoryItemComponent } from '../history-item/history-item.component';
import { AuditItem } from '../../../shared/state/history/history.feature';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss'],
  standalone: true,
  imports: [NgIf, HistoryItemComponent, NgFor],
})
export class HistoryListComponent {
  items = signal<AuditItem[]>([]);
  currentlyPlaying = signal<AuditItem | undefined>(undefined);

  constructor(
    private readonly playbackService: PlaybackService,
    private readonly historyService: HistoryService,
    private readonly ref: ChangeDetectorRef
  ) {
    /**
     * Very annoyed with the detectChanges() being required here.
     * Tauri is doing something funky or zone.js is not detecting the view properly.
     * Am forced to have these here for whatever reason of they wont visually update.
     */

    this.playbackService.audioStarted$
      .pipe(takeUntilDestroyed())
      .subscribe((id) => {
        this.currentlyPlaying.set(this.items().find((i) => i.id === id));
        this.ref.detectChanges();
      });

    this.playbackService.audioFinished$
      .pipe(takeUntilDestroyed())
      .subscribe((id) => {
        if (this.currentlyPlaying()?.id !== id) return;
        this.currentlyPlaying.set(undefined);
        this.ref.detectChanges();
      });

    this.historyService.auditItems$
      .pipe(takeUntilDestroyed())
      .subscribe((items) => {
        this.items.set(items);
        this.ref.detectChanges();
      });
  }
}
