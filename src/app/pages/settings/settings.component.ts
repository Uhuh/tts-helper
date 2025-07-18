import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfigService } from 'src/app/shared/services/config.service';
import { AudioService } from 'src/app/shared/services/audio.service';
import { TtsMonsterComponent } from './tts-monster/tts-monster.component';
import { AmazonPollyComponent } from './amazon-polly/amazon-polly.component';
import { StreamElementsComponent } from './streamelement-tts/stream-elements.component';
import { CommonModule } from '@angular/common';
import { DeviceComponent } from './device/device.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { TiktokComponent } from './tiktok/tiktok.component';
import { TtsType } from '../../shared/state/config/config.feature';
import { FormControl } from '@angular/forms';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';
import { ElevenLabsComponent } from './eleven-labs/eleven-labs.component';
import { ToggleComponent } from '../../shared/components/toggle/toggle.component';

interface TtsOption {
  disabled?: boolean;
  displayValue: string;
  value: TtsType;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [
    InputComponent,
    ButtonComponent,
    DeviceComponent,
    CommonModule,
    StreamElementsComponent,
    AmazonPollyComponent,
    TtsMonsterComponent,
    TiktokComponent,
    LabelBlockComponent,
    ElevenLabsComponent,
    ToggleComponent,
  ],
})
export class SettingsComponent {
  private readonly audioService = inject(AudioService);
  private readonly configService = inject(ConfigService);

  readonly ttsControl = new FormControl('', { nonNullable: true });
  readonly selectedTts = new FormControl<TtsType>('stream-elements', { nonNullable: true });
  readonly chaosModeControl = new FormControl(false, { nonNullable: true });
  readonly ttsOptions: Array<TtsOption> = [
    {
      displayValue: 'StreamElements',
      value: 'stream-elements',
    },
    {
      displayValue: 'Amazon Polly',
      value: 'amazon-polly',
    },
    {
      displayValue: 'TikTok',
      value: 'tiktok',
    },
    {
      displayValue: 'ElevenLabs',
      value: 'eleven-labs',
    },
    {
      displayValue: 'TTS Monster',
      value: 'tts-monster',
      disabled: true,
    },
  ];

  constructor() {
    this.configService.configTts$
      .pipe(takeUntilDestroyed())
      .subscribe(tts => this.selectedTts.patchValue(tts, { emitEvent: false }));

    this.configService.state$
      .pipe(takeUntilDestroyed())
      .subscribe(state => this.chaosModeControl.setValue(state.chaosMode, { emitEvent: false }));

    this.chaosModeControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(chaosMode => this.configService.updateState({ chaosMode }));
  }

  selectTts(tts: TtsType) {
    this.selectedTts.setValue(tts);

    this.configService.updateTts(tts);
  }

  speak(): void {
    const { value } = this.ttsControl;
    this.ttsControl.setValue('');

    this.audioService.playTts(
      value ?? 'Oops no rizz!',
      '',
      'tts-helper',
      1000,
      true,
    );
  }

  get isDisabled() {
    return this.ttsControl.value === '';
  }
}

export default SettingsComponent;