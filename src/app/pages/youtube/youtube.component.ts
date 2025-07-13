import { Component, computed, effect, inject } from '@angular/core';
import { InputComponent } from '../../shared/components/input/input.component';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';
import { FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, tap } from 'rxjs';
import { YoutubeService } from '../../shared/services/youtube.service';
import { SuperchatComponent } from './superchat/superchat.component';

@Component({
  selector: 'app-youtube',
  imports: [
    InputComponent,
    LabelBlockComponent,
    SuperchatComponent,
  ],
  templateUrl: './youtube.component.html',
  styleUrl: './youtube.component.scss',
})
export class YoutubeComponent {
  readonly #youtubeService = inject(YoutubeService);
  readonly liveId = computed(() => this.#youtubeService.liveId());
  readonly hasError = computed(() => this.#youtubeService.hasError());
  readonly channelControl = new FormControl('', { nonNullable: true });

  constructor() {
    this.channelControl.valueChanges
      .pipe(
        takeUntilDestroyed(),
        debounceTime(500),
        tap(id => this.#youtubeService.updateChannelId(id)),
      )
      .subscribe();

    effect(() => {
      const channelId = this.#youtubeService.youtubeStore.channelId();

      this.channelControl.patchValue(channelId, { emitEvent: false });
    });
  }
}

export default YoutubeComponent;
