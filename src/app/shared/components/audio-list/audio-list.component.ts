import { Component, inject, Input } from '@angular/core';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AudioItemComponent } from '../audio-item/audio-item.component';
import { map } from 'rxjs';
import { AudioStatus } from '../../state/audio/audio.feature';
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

  private readonly audioService = inject(AudioService);
  protected readonly AudioState = AudioStatus;

  readonly audioItems$ = this.audioService.audioItems$
    .pipe(
      map(items => items.filter(i => this.filters?.length ? this.filters.includes(i.state) : true)),
    );
  readonly currentlyPlaying$ = this.audioService.audioItems$
    .pipe(
      map(items => items.find(i => i.state === AudioStatus.playing)),
    );
}
