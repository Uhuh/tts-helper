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
  charLimit = new FormControl(300, { nonNullable: true, validators: [Validators.min(0)] });

  settingsGroup = new FormGroup({
    apiToken: new FormControl('', { nonNullable: true }),
    enabled: new FormControl(false, { nonNullable: true }),
    historyLimit: new FormControl(0, { nonNullable: true, validators: [Validators.min(0), Validators.max(20)] }),
    presencePenalty: new FormControl(0, { nonNullable: true, validators: [Validators.min(-2), Validators.max(2)] }),
    frequencyPenalty: new FormControl(0, { nonNullable: true, validators: [Validators.min(-2), Validators.max(2)] }),
    maxTokens: new FormControl(100, { nonNullable: true, validators: [Validators.min(0)] }),
    temperature: new FormControl(1, { nonNullable: true }),
  });

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
        this.settingsGroup.setValue(settings, { emitEvent: false });
      });

    this.openAIService.chatSettings$
      .pipe(takeUntilDestroyed(), take(1))
      .subscribe(chatSettings => {
        this.charLimit.setValue(chatSettings.charLimit, { emitEvent: false });
      });

    this.personalityGroup.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(personality => this.openAIService.updatePersonality(personality));

    this.settingsGroup.valueChanges
      .pipe(takeUntilDestroyed(), filter(() => this.settingsGroup.valid))
      .subscribe(settings => this.openAIService.updateSettings({
        ...settings,
        // Maybe I should look into material inputs so they can handle the conversions for me.
        presencePenalty: Number(settings.presencePenalty),
        temperature: Number(settings.temperature),
        frequencyPenalty: Number(settings.frequencyPenalty),
        historyLimit: Number(settings.historyLimit),
        maxTokens: Number(settings.maxTokens),
      }));

    this.charLimit.valueChanges
      .pipe(takeUntilDestroyed(), filter(() => this.charLimit.valid))
      .subscribe(charLimit => this.openAIService.updateChatSettings({ charLimit }));
  }
}

export default ChatGptComponent;