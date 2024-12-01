import { Component, inject, input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { MultiVoice, TtsType } from '../../../shared/state/config/config.feature';
import { AccordionComponent } from '../../../shared/components/accordion/accordion.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { SelectorComponent } from '../../../shared/components/selector/selector.component';
import {
  TTSOption,
  TtsSelectorComponent,
  Voices,
} from '../../../shared/components/tts-selector/tts-selector.component';
import { FormControl, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import tiktokVoices from '../../../shared/json/tiktok.json';
import streamelementsVoices from '../../../shared/json/stream-elements.json';
import { ConfigService } from '../../../shared/services/config.service';
import { ElevenLabsService } from '../../../shared/services/eleven-labs.service';
import { map } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-multi-voice-accordion',
    imports: [
        AccordionComponent,
        ButtonComponent,
        InputComponent,
        LabelBlockComponent,
        SelectorComponent,
        TtsSelectorComponent,
        AsyncPipe,
    ],
    templateUrl: './multi-voice-accordion.component.html',
    styleUrl: './multi-voice-accordion.component.scss'
})
export class MultiVoiceAccordionComponent implements OnChanges {
  private readonly configService = inject(ConfigService);
  private readonly elevenLabsService = inject(ElevenLabsService);

  private readonly ttsVoices = new Map([
    ['tiktok', tiktokVoices],
    ['stream-elements', streamelementsVoices],
  ]);

  readonly voices = signal<Voices[]>(streamelementsVoices);
  readonly multiVoice = input.required<MultiVoice>();

  readonly elevenLabVoices$ = this.elevenLabsService.state$
    .pipe(
      map(state => state.voices.map(v => ({
        value: v.voice_id,
        displayName: `${v.name} - ${v.category}`,
      }))),
    );

  readonly ttsOptions: Array<TTSOption> = [
    {
      displayName: 'StreamElements',
      value: 'stream-elements',
    },
    {
      displayName: 'TikTok',
      value: 'tiktok',
    },
    {
      displayName: 'ElevenLabs',
      value: 'eleven-labs',
    },
  ];

  readonly settings = new FormGroup({
    customName: new FormControl('', { nonNullable: true }),
    ttsType: new FormControl<TtsType>('stream-elements', { nonNullable: true }),
    voice: new FormControl('', { nonNullable: true }),
    language: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.settings.controls.ttsType.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(ttsType => this.voices.set(this.ttsVoices.get(ttsType) ?? []));

    this.settings.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(settings => this.configService.updateMultiVoice(this.multiVoice().id, settings));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['multiVoice']) {
      return;
    }

    const { multiVoice } = changes;
    const { id, ...settings } = multiVoice.currentValue;

    this.settings.setValue(settings, { emitEvent: false });

    const voices = this.ttsVoices.get(settings.ttsType) ?? [];
    this.voices.set(voices);
  }

  delete() {
    this.configService.deleteMultiVoice(this.multiVoice().id);
  }
}
