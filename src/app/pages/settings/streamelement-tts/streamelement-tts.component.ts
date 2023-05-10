import { Component } from '@angular/core';
import { nonNullFormControl } from 'src/app/shared/utils/form';
import { ConfigService } from 'src/app/shared/services/config.service';
import voices from '../../../shared/json/stream-elements-options.json';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

export interface TTSOption {
  key: string;
  displayName: string;
}

@Component({
  selector: 'app-streamelement-tts',
  templateUrl: './streamelement-tts.component.html',
  styleUrls: ['./streamelement-tts.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    MatOptionModule,
  ],
})
export class StreamelementTtsComponent {
  languageVoiceMap = new Map<string, TTSOption[]>();
  languageOptions: string[] = [];
  languageVoiceOptions: TTSOption[] = [];

  voiceControl = nonNullFormControl('');
  languageControl = nonNullFormControl('');

  constructor(private readonly configService: ConfigService) {
    for (const voice of voices) {
      this.languageVoiceMap.set(voice.language, voice.options);
    }

    this.languageOptions = [...this.languageVoiceMap.keys()];

    this.configService.streamElements$
      .pipe(takeUntilDestroyed())
      .subscribe((streamElements) => {
        this.languageControl.patchValue(streamElements.language, {
          emitEvent: false,
        });

        this.languageVoiceOptions =
          this.languageVoiceMap.get(streamElements.language) ?? [];

        this.voiceControl.patchValue(streamElements.voice, {
          emitEvent: false,
        });
      });

    this.languageControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((language) => {
        if (language === '') {
          this.languageVoiceOptions = [];
          return;
        }

        const options = this.languageVoiceMap.get(language);
        this.languageVoiceOptions = options ?? [];
        this.voiceControl.patchValue(this.languageVoiceOptions[0].key ?? '');

        this.configService.updateStreamElementsLanguage(language);
      });

    this.voiceControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((voice) => {
        this.configService.updateVoice(voice);
      });
  }
}
