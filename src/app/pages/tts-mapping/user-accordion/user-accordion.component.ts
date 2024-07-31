import { Component, inject, input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { ChoiceCommandComponent } from '../../vstream/commands/edit-command/choice-command/choice-command.component';
import { CounterCommandComponent } from '../../vstream/commands/edit-command/counter-command/counter-command.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { MatIconModule } from '@angular/material/icon';
import { SelectorComponent } from '../../../shared/components/selector/selector.component';
import { SoundCommandComponent } from '../../vstream/commands/edit-command/sound-component/sound-command.component';
import { TextCommandComponent } from '../../vstream/commands/edit-command/text-command/text-command.component';
import { CustomUserVoice, TtsType } from '../../../shared/state/config/config.feature';
import { ConfigService } from '../../../shared/services/config.service';
import { FormControl, FormGroup } from '@angular/forms';
import {
  TTSOption,
  TtsSelectorComponent,
  Voices,
} from '../../../shared/components/tts-selector/tts-selector.component';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import streamelementsVoices from '../../../shared/json/stream-elements.json';
import tiktokVoices from '../../../shared/json/tiktok.json';
import { InputComponent } from '../../../shared/components/input/input.component';
import { AccordionComponent } from '../../../shared/components/accordion/accordion.component';

@Component({
  selector: 'app-user-accordion',
  standalone: true,
  imports: [
    ButtonComponent,
    CdkAccordionModule,
    ChoiceCommandComponent,
    CounterCommandComponent,
    LabelBlockComponent,
    MatIconModule,
    SelectorComponent,
    SoundCommandComponent,
    TextCommandComponent,
    AsyncPipe,
    InputComponent,
    TtsSelectorComponent,
    AccordionComponent,
  ],
  templateUrl: './user-accordion.component.html',
  styleUrl: './user-accordion.component.scss',
})
export class UserAccordionComponent implements OnChanges {
  private readonly configService = inject(ConfigService);
  private readonly ttsVoices = new Map([
    ['tiktok', tiktokVoices],
    ['stream-elements', streamelementsVoices],
  ]);

  // Default to SE.
  readonly voices = signal<Voices[]>(streamelementsVoices);
  readonly customUserVoice = input.required<CustomUserVoice>();

  readonly ttsOptions: Array<TTSOption> = [
    {
      displayName: 'StreamElements',
      value: 'stream-elements',
    },
    {
      displayName: 'TikTok',
      value: 'tiktok',
    },
  ];

  readonly settings = new FormGroup({
    username: new FormControl('', { nonNullable: true }),
    ttsType: new FormControl<TtsType>('stream-elements', { nonNullable: true }),
    voice: new FormControl('', { nonNullable: true }),
    language: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.settings.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(settings => {
        this.configService.updateCustomUserVoice(this.customUserVoice().id, settings);
      });

    this.settings.controls.ttsType.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(ttsType => {
        this.voices.set(this.ttsVoices.get(ttsType) ?? []);
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['customUserVoice']) {
      return;
    }

    const { customUserVoice } = changes;
    const { id, ...settings } = customUserVoice.currentValue;

    this.settings.setValue(settings, { emitEvent: false });

    const voices = this.ttsVoices.get(settings.ttsType) ?? [];
    this.voices.set(voices);
  }

  delete() {
    this.configService.deleteCustomUserVoice(this.customUserVoice().id);
  }
}
