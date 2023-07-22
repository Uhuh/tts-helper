import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../shared/components/input/input.component';
import { FormControl, FormGroup } from '@angular/forms';
import { ToggleComponent } from '../../shared/components/toggle/toggle.component';
import { GptPersonalityComponent } from './gpt-personality/gpt-personality.component';
import { ConfigService } from '../../shared/services/config.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface GptPersonalityFormGroup {
  streamersIdentity: FormControl<string>;
  streamerModelRelation: FormControl<string>;
  modelsIdentity: FormControl<string>;
  modelsCoreIdentity: FormControl<string>;
  modelsBackground: FormControl<string>;
}

@Component({
  selector: 'app-chat-gpt',
  standalone: true,
  imports: [CommonModule, InputComponent, ToggleComponent, GptPersonalityComponent],
  templateUrl: './chat-gpt.component.html',
  styleUrls: ['./chat-gpt.component.scss']
})
export class ChatGptComponent {
  apiKeyControl = new FormControl('', { nonNullable: true });
  enableGptControl = new FormControl(false, { nonNullable: true });

  /**
   * These are to make the ChatGPT model a little more personal.
   * These are all for the { "role": "system" } content messages when sending to OpenAI.
   */
  personalityGroup = new FormGroup<GptPersonalityFormGroup>({
    streamersIdentity: new FormControl('', { nonNullable: true }),
    streamerModelRelation: new FormControl('', { nonNullable: true }),
    modelsIdentity: new FormControl('', { nonNullable: true }),
    modelsCoreIdentity: new FormControl('', { nonNullable: true }),
    modelsBackground: new FormControl('', { nonNullable: true }),
  });

  constructor(private readonly configService: ConfigService) {
    this.configService.gptPersonality$
      .pipe(takeUntilDestroyed())
      .subscribe(personality => this.personalityGroup.setValue(personality, { emitEvent: false }));

    this.configService.gptSettings$
      .pipe(takeUntilDestroyed())
      .subscribe(gptSettings => {
        this.apiKeyControl.setValue(gptSettings.apiToken, { emitEvent: false });
        this.enableGptControl.setValue(gptSettings.enabled, { emitEvent: false });
      });

    this.personalityGroup.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(personality => this.configService.updateGptPersonality(personality));

    this.enableGptControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(enabled => this.configService.updateGptSettings({ enabled }));
    
    this.apiKeyControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(apiToken => this.configService.updateGptSettings({ apiToken }));
  }
}

export default ChatGptComponent;