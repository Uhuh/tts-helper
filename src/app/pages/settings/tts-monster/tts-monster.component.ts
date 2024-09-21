import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputComponent } from '../../../shared/components/input/input.component';
import { FormControl } from '@angular/forms';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { TtsMonsterStateService } from '../../../shared/services/tts-monster.service';

@Component({
  selector: 'app-tts-monster',
  templateUrl: './tts-monster.component.html',
  styleUrls: ['./tts-monster.component.scss'],
  standalone: true,
  imports: [InputComponent, LabelBlockComponent],
})
export class TtsMonsterComponent {
  private readonly ttsMonsterStateService = inject(TtsMonsterStateService);
  readonly voices$ = this.ttsMonsterStateService.voices$;

  readonly apiKey = new FormControl('', { nonNullable: true });

  constructor() {
    this.ttsMonsterStateService.apiKey$
      .pipe(takeUntilDestroyed())
      .subscribe((apiKey) => this.apiKey.patchValue(apiKey, { emitEvent: false }));

    this.apiKey.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((apiKey) => this.ttsMonsterStateService.updateSettings({ apiKey }));
  }
}
