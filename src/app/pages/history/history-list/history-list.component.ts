import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AudioService } from '../../../shared/services/audio.service';
import { HistoryItemComponent } from '../history-item/history-item.component';
import { AudioItem, AudioStatus } from '../../../shared/state/audio/audio.feature';
import { map } from 'rxjs';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss'],
  standalone: true,
  imports: [NgIf, HistoryItemComponent, NgFor, NgClass, AsyncPipe],
})
export class HistoryListComponent {
  protected readonly AudioState = AudioStatus;
  private readonly destroyRef = inject(DestroyRef);
  
  audioItems$ = this.audioService.audioItems$;
  currentlyPlaying$ = this.audioService.audioItems$
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      map(items => items.find(i => i.state === AudioStatus.playing))  
    );

  constructor(private readonly audioService: AudioService) {}

  trackBy(index: number, item: AudioItem) {
    return item.id;
  }
}
