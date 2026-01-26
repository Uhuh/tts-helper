import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import voices from '../../../shared/json/azure-tts.json';
import { TtsSelectorComponent } from '../../../shared/components/tts-selector/tts-selector.component';
import { AzureTtsService } from '../../../shared/services/azure-tts.service';
import { FormControl, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-azure-tts',
  imports: [
    RouterLink,
    TtsSelectorComponent,
  ],
  templateUrl: './azure-tts.component.html',
  styleUrl: './azure-tts.component.scss',
})
export class AzureTtsComponent {
  readonly #azureTtsService = inject(AzureTtsService);
  readonly voices = voices;

  readonly settings = new FormGroup({
    ttsVoice: new FormControl('', { nonNullable: true }),
    ttsLanguage: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.#azureTtsService.state$
      .pipe(takeUntilDestroyed())
      .subscribe(state => {
        this.settings.patchValue({
          ttsVoice: state.ttsVoice,
          ttsLanguage: state.ttsLanguage,
        }, { emitEvent: false });
      });

    this.settings.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(settings => this.#azureTtsService.updatePartialState(settings));
  }
}

