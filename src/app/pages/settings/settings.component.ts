import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfigService } from 'src/app/shared/services/config.service';
import { AudioService } from 'src/app/shared/services/audio.service';
import { TtsMonsterComponent } from './tts-monster/tts-monster.component';
import { AmazonPollyComponent } from './amazon-polly/amazon-polly.component';
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
import { Option, SelectorComponent } from "../../shared/components/selector/selector.component";
import { StreamlabsComponent } from "./streamlabs-tts/streamlabs.component";
import { AzureTtsComponent } from './azure-tts/azure-tts.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [
    InputComponent,
    ButtonComponent,
    DeviceComponent,
    CommonModule,
    AmazonPollyComponent,
    TtsMonsterComponent,
    TiktokComponent,
    LabelBlockComponent,
    ElevenLabsComponent,
    ToggleComponent,
    SelectorComponent,
    StreamlabsComponent,
    AzureTtsComponent,
  ],
})
export class SettingsComponent {
  private readonly audioService = inject(AudioService);
  private readonly configService = inject(ConfigService);

  readonly ttsControl = new FormControl('', { nonNullable: true });
  readonly selectedTts = new FormControl<TtsType>('streamlabs', { nonNullable: true });
  readonly chaosModeControl = new FormControl(false, { nonNullable: true });
  readonly ttsOptions: Array<Option<TtsType>> = [
    {
      displayName: 'Free - StreamLabs',
      value: 'streamlabs',
    },
    {
      displayName: 'Free - TikTok',
      value: 'tiktok',
    },
    {
      displayName: 'Paid - Azure TTS',
      value: 'azure',
    },
    {
      displayName: 'Paid - ElevenLabs',
      value: 'eleven-labs',
    },
    {
      displayName: 'Paid - TTS Monster',
      value: 'tts-monster',
    },
    {
      displayName: 'Paid - Amazon Polly',
      value: 'amazon-polly',
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

    this.selectedTts.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(tts => this.configService.updateState({ tts }));
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