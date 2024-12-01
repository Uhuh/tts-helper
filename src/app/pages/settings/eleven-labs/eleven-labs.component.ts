import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../../shared/components/input/input.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { SelectorComponent } from '../../../shared/components/selector/selector.component';
import { TTSOption, TtsSelectorComponent } from '../../../shared/components/tts-selector/tts-selector.component';
import { FormControl, FormGroup } from '@angular/forms';
import { ElevenLabsService } from '../../../shared/services/eleven-labs.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-eleven-labs',
    imports: [CommonModule, InputComponent, LabelBlockComponent, SelectorComponent, TtsSelectorComponent],
    templateUrl: './eleven-labs.component.html',
    styleUrl: './eleven-labs.component.scss'
})
export class ElevenLabsComponent {
  private readonly elevenLabsService = inject(ElevenLabsService);

  readonly elevenLabs = new FormGroup({
    apiKey: new FormControl('', { nonNullable: true }),
    voiceId: new FormControl('', { nonNullable: true }),
    modelId: new FormControl('', { nonNullable: true }),
  });

  voiceOptions: TTSOption[] = [];
  modelOptions: TTSOption[] = [];

  constructor() {
    this.elevenLabsService.state$
      .pipe(takeUntilDestroyed())
      .subscribe(state => {
        const { voices, models, ...rest } = state;

        this.elevenLabs.setValue(rest, { emitEvent: false });

        this.voiceOptions = voices.map(v => ({
          value: v.voice_id,
          displayName: `${v.name} - ${v.category}`,
        }));

        this.modelOptions = models.map(m => ({
          value: m.model_id,
          displayName: m.name,
        }));
      });

    this.elevenLabs.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(partialState => {
        this.elevenLabsService.updateState(partialState);
      });
  }
}
