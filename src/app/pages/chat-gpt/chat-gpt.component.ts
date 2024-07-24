import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../shared/components/input/input.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToggleComponent } from '../../shared/components/toggle/toggle.component';
import { GptPersonalityComponent } from './gpt-personality/gpt-personality.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { filter, map, switchMap } from 'rxjs';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';
import { OpenAIService } from '../../shared/services/openai.service';
import { AdvancedSettingsComponent } from './advanced-settings/advanced-settings.component';
import { MatTabsModule } from '@angular/material/tabs';
import { Option, SelectorComponent } from '../../shared/components/selector/selector.component';

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
  imports: [CommonModule, InputComponent, ToggleComponent, GptPersonalityComponent, MatInputModule, MatSliderModule, ReactiveFormsModule, LabelBlockComponent, AdvancedSettingsComponent, MatTabsModule, SelectorComponent],
  templateUrl: './chat-gpt.component.html',
  styleUrls: ['./chat-gpt.component.scss'],
})
export class ChatGptComponent {
  private readonly openAIService = inject(OpenAIService);

  readonly charLimit = new FormControl(300, { nonNullable: true, validators: [Validators.min(0)] });

  readonly settings = new FormGroup({
    model: new FormControl('', { nonNullable: true }),
    apiToken: new FormControl('', { nonNullable: true }),
    enabled: new FormControl(false, { nonNullable: true }),
    historyLimit: new FormControl(0, { nonNullable: true, validators: [Validators.min(0), Validators.max(20)] }),
  });

  readonly models$ = this.openAIService.settings$.pipe(
    switchMap(() => this.openAIService.getUserModels()),
    map(models => {
      if ('data' in models) {
        return models.data
          .filter(d => d.id.includes('gpt'))
          .map<Option<string>>(d => ({
            value: d.id,
            displayName: d.id,
          }));
      }

      return [];
    }),
  );

  constructor() {
    this.openAIService.settings$
      .pipe(takeUntilDestroyed())
      .subscribe(settings => this.settings.setValue({
        enabled: settings.enabled,
        historyLimit: settings.historyLimit,
        apiToken: settings.apiToken,
        model: settings.model,
      }, { emitEvent: false }));

    this.openAIService.chatSettings$
      .pipe(takeUntilDestroyed())
      .subscribe(chatSettings => {
        this.charLimit.setValue(chatSettings.charLimit, { emitEvent: false });
      });

    this.settings.valueChanges
      .pipe(takeUntilDestroyed(), filter(() => this.settings.valid))
      .subscribe(settings => this.openAIService.updateSettings({
        ...settings,
        historyLimit: Number(settings.historyLimit),
      }));

    this.charLimit.valueChanges
      .pipe(takeUntilDestroyed(), filter(() => this.charLimit.valid))
      .subscribe(charLimit => this.openAIService.updateChatSettings({ charLimit }));
  }
}

export default ChatGptComponent;