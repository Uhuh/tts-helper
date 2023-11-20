import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../shared/components/input/input.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToggleComponent } from '../../shared/components/toggle/toggle.component';
import { GptPersonalityComponent } from './gpt-personality/gpt-personality.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { filter, take } from 'rxjs';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';
import { OpenAIService } from '../../shared/services/openai.service';

export interface GptPersonalityFormGroup {
  streamersIdentity: FormControl<string>;
  streamerModelRelation: FormControl<string>;
  streamersThoughtsOnModel: FormControl<string>;
  modelsIdentity: FormControl<string>;
  modelsCoreIdentity: FormControl<string>;
  modelsBackground: FormControl<string>;
}

@Component({
  selector: 'app-chat-gpt',
  standalone: true,
  imports: [CommonModule, InputComponent, ToggleComponent, GptPersonalityComponent, MatInputModule, MatSliderModule, ReactiveFormsModule, LabelBlockComponent],
  templateUrl: './chat-gpt.component.html',
  styleUrls: ['./chat-gpt.component.scss'],
})
export class ChatGptComponent {
  apiKey = new FormControl('', { nonNullable: true });
  enable = new FormControl(false, { nonNullable: true });
  history = new FormControl(0, { nonNullable: true, validators: [Validators.min(0), Validators.max(20)] });
  charLimit = new FormControl(300, { nonNullable: true, validators: [Validators.min(0)] });

  /**
   * These are to make the ChatGPT model a little more personal.
   * These are all for the { "role": "system" } content messages when sending to OpenAI.
   */
  personalityGroup = new FormGroup<GptPersonalityFormGroup>({
    streamersIdentity: new FormControl('', { nonNullable: true }),
    streamerModelRelation: new FormControl('', { nonNullable: true }),
    streamersThoughtsOnModel: new FormControl('', { nonNullable: true }),
    modelsIdentity: new FormControl('', { nonNullable: true }),
    modelsCoreIdentity: new FormControl('', { nonNullable: true }),
    modelsBackground: new FormControl('', { nonNullable: true }),
  });

  constructor(private readonly openAIService: OpenAIService) {
    this.openAIService.personality$
      .pipe(takeUntilDestroyed(), take(1))
      .subscribe(personality => this.personalityGroup.setValue(personality, { emitEvent: false }));

    this.openAIService.settings$
      .pipe(takeUntilDestroyed(), take(1))
      .subscribe(settings => {
        this.apiKey.setValue(settings.apiToken, { emitEvent: false });
        this.enable.setValue(settings.enabled, { emitEvent: false });
        this.history.setValue(settings.historyLimit, { emitEvent: false });
      });

    this.openAIService.chatSettings$
      .pipe(takeUntilDestroyed(), take(1))
      .subscribe(chatSettings => {
        this.charLimit.setValue(chatSettings.charLimit, { emitEvent: false });
      });

    this.personalityGroup.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(personality => this.openAIService.updatePersonality(personality));

    this.enable.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(enabled => this.openAIService.updateSettings({ enabled }));

    this.apiKey.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(apiToken => this.openAIService.updateSettings({ apiToken }));

    this.charLimit.valueChanges
      .pipe(takeUntilDestroyed(), filter(() => this.charLimit.valid))
      .subscribe(charLimit => this.openAIService.updateChatSettings({ charLimit }));

    this.history.valueChanges
      .pipe(takeUntilDestroyed(), filter(() => this.history.valid))
      .subscribe(historyLimit => this.openAIService.updateSettings({ historyLimit }));
  }
}

export default ChatGptComponent;