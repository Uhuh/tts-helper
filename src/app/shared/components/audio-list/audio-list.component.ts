import { Component, DestroyRef, inject, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AudioItemComponent } from '../audio-item/audio-item.component';
import { map } from 'rxjs';
import { AudioItem, AudioStatus } from '../../state/audio/audio.feature';
import { AudioService } from '../../services/audio.service';
import { LabelBlockComponent } from '../input-block/label-block.component';

@Component({
  selector: 'app-audio-list',
  templateUrl: './audio-list.component.html',
  styleUrls: ['./audio-list.component.scss'],
  standalone: true,
  imports: [NgIf, AudioItemComponent, NgFor, NgClass, AsyncPipe, LabelBlockComponent],
})
export class AudioListComponent {
  @Input() filters?: AudioStatus[];

  protected readonly AudioState = AudioStatus;
  private readonly destroyRef = inject(DestroyRef);

  audioItems$ = this.audioService.audioItems$
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      map(items => items.filter(i => this.filters?.length ? this.filters.includes(i.state) : true)),
    );
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
