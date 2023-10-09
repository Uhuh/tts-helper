import { ChangeDetectionStrategy, ChangeDetectorRef, Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgFor, NgIf } from '@angular/common';
import { HistoryService } from '../../../shared/services/history.service';
import { PlaybackService } from '../../../shared/services/playback.service';
import { HistoryItemComponent } from '../history-item/history-item.component';
import { AuditItem } from '../../../shared/state/history/history.feature';
import { LogService } from '../../../shared/services/logs.service';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss'],
  standalone: true,
  imports: [NgIf, HistoryItemComponent, NgFor],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryListComponent {
  items: AuditItem[] = [];
  currentlyPlaying?: AuditItem;

  constructor(
    private readonly playbackService: PlaybackService,
    private readonly historyService: HistoryService,
    private readonly logService: LogService,
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
        this.currentlyPlaying = this.items.find(i => i.id === id);
        this.ref.detectChanges();
      });

    this.playbackService.audioFinished$
      .pipe(takeUntilDestroyed())
      .subscribe((id) => {
        this.currentlyPlaying = undefined;
        this.ref.detectChanges();
      });

    this.historyService.auditItems$
      .pipe(takeUntilDestroyed())
      .subscribe((items) => {
        this.items = [...items];
        // this.ref.detectChanges();
      });
  }
  
  skipped(id: number) {
    if (this.currentlyPlaying?.id !== id) {
      return;
    }

    const item = this.items.find(i => i.id === id);
    this.logService.add(`Skipped audio: ${JSON.stringify(item)}`, 'info', 'HistoryListComponent.audioFinished$');
    
    this.currentlyPlaying = undefined;
  }

  trackBy(index: number, item: AuditItem) {
    return item.id;
  }
}
