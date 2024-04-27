import { Component, inject } from '@angular/core';
import { InputComponent } from '../../../shared/components/input/input.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OpenAIService } from '../../../shared/services/openai.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

@Component({
  selector: 'app-advanced-settings',
  standalone: true,
  imports: [
    InputComponent,
    LabelBlockComponent,
    MatFormFieldModule,
  ],
  templateUrl: './advanced-settings.component.html',
  styleUrl: './advanced-settings.component.scss',
})
export class AdvancedSettingsComponent {
  private readonly openaiService = inject(OpenAIService);

  readonly settings = new FormGroup({
    presencePenalty: new FormControl(0, { nonNullable: true, validators: [Validators.min(-2), Validators.max(2)] }),
    frequencyPenalty: new FormControl(0, { nonNullable: true, validators: [Validators.min(-2), Validators.max(2)] }),
    maxTokens: new FormControl(100, { nonNullable: true, validators: [Validators.min(0)] }),
    temperature: new FormControl(1, { nonNullable: true }),
  });

  constructor() {
    this.openaiService.settings$
      .pipe(takeUntilDestroyed())
      .subscribe(settings => this.settings.setValue({
        presencePenalty: settings.presencePenalty,
        frequencyPenalty: settings.frequencyPenalty,
        maxTokens: settings.maxTokens,
        temperature: settings.temperature,
      }, { emitEvent: false }));

    this.settings.valueChanges
      .pipe(takeUntilDestroyed(), filter(() => this.settings.valid))
      .subscribe(settings => this.openaiService.updateSettings({
        presencePenalty: Number(settings.presencePenalty),
        temperature: Number(settings.temperature),
        frequencyPenalty: Number(settings.frequencyPenalty),
        maxTokens: Number(settings.maxTokens),
      }));
  }
}
