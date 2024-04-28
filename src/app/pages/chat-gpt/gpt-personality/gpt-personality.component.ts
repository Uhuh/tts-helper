import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GptPersonalityFormGroup } from '../chat-gpt.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OpenAIService } from '../../../shared/services/openai.service';

@Component({
  selector: 'app-gpt-personality',
  standalone: true,
  imports: [CommonModule, InputComponent, ReactiveFormsModule, LabelBlockComponent],
  templateUrl: './gpt-personality.component.html',
  styleUrls: ['./gpt-personality.component.scss'],
})
export class GptPersonalityComponent {
  private readonly openaiService = inject(OpenAIService);

  readonly settings = new FormGroup<GptPersonalityFormGroup>({
    streamersIdentity: new FormControl('', { nonNullable: true }),
    streamerModelRelation: new FormControl('', { nonNullable: true }),
    streamersThoughtsOnModel: new FormControl('', { nonNullable: true }),
    modelsIdentity: new FormControl('', { nonNullable: true }),
    modelsCoreIdentity: new FormControl('', { nonNullable: true }),
    modelsBackground: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.settings.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(personality => this.openaiService.updatePersonality(personality));

    this.openaiService.personality$
      .pipe(takeUntilDestroyed())
      .subscribe(personality => this.settings.setValue(personality, { emitEvent: false }));
  }
}
