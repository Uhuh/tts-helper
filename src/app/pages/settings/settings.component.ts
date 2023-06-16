import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfigService } from 'src/app/shared/services/config.service';
import { HistoryService } from 'src/app/shared/services/history.service';
import { TtsType } from 'src/app/shared/state/config/config.interface';
import { nonNullFormControl } from 'src/app/shared/utils/form';
import { WindowsComponent } from './windows/windows.component';
import { TtsMonsterComponent } from './tts-monster/tts-monster.component';
import { AmazonPollyComponent } from './amazon-polly/amazon-polly.component';
import { StreamelementTtsComponent } from './streamelement-tts/streamelement-tts.component';
import { CommonModule } from '@angular/common';
import { DeviceComponent } from './device/device.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { TiktokComponent } from './tiktok/tiktok.component';

interface TtsOption {
  disabled?: boolean;
  displayValue: string;
  value: TtsType;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: [
    InputComponent,
    ButtonComponent,
    DeviceComponent,
    CommonModule,
    StreamelementTtsComponent,
    AmazonPollyComponent,
    TtsMonsterComponent,
    WindowsComponent,
    TiktokComponent,
  ],
})
export class SettingsComponent {
  ttsControl = nonNullFormControl('');
  selectedTts = nonNullFormControl<TtsType>('stream-elements');
  ttsOptions: Array<TtsOption> = [
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
      displayValue: 'Windows',
      value: 'windows',
      disabled: true,
    },
    {
      displayValue: 'TTS Monster',
      value: 'tts-monster',
      disabled: true,
    },
  ];

  constructor(
    private readonly historyService: HistoryService,
    private readonly configService: ConfigService
  ) {
    this.configService.configTts$
      .pipe(takeUntilDestroyed())
      .subscribe((tts) => {
        this.selectedTts.patchValue(tts, {
          emitEvent: false,
        });
      });
  }

  selectTts(tts: TtsType) {
    this.selectedTts.setValue(tts);

    this.configService.updateTts(tts);
  }

  speak(): void {
    const { value } = this.ttsControl;
    this.ttsControl.setValue('');

    this.historyService.playTts(
      value ?? 'Oops no rizz!',
      '',
      'tts-helper',
      1000
    );
  }

  get isDisabled() {
    return this.ttsControl.value === '';
  }
}
