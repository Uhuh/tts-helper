import { Subject, first, takeUntil } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { nonNullFormControl } from 'src/app/shared/utils/form';
import voices from '../../../shared/json/tts-options.json';
import { ConfigService } from 'src/app/shared/services/config.service';
import { isKeyOfObject } from 'src/app/shared/utils/util';

export interface TTSOption {
  key: string;
  displayName: string;
}

@Component({
  selector: 'app-streamelement-tts',
  templateUrl: './streamelement-tts.component.html',
  styleUrls: ['./streamelement-tts.component.scss'],
})
export class StreamelementTtsComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  languageOptions = [...Object.keys(voices.streamElements)];
  languageVoiceOptions: TTSOption[] = [];

  voiceControl = nonNullFormControl('');
  languageControl = nonNullFormControl('');

  constructor(private readonly configService: ConfigService) {}

  ngOnInit(): void {
    this.configService.voiceSettings$
      .pipe(first(), takeUntil(this.destroyed$))
      .subscribe((voiceSettings) => {
        this.languageControl.patchValue(voiceSettings.language, {
          emitEvent: false,
        });

        if (
          voiceSettings.language &&
          isKeyOfObject(voiceSettings.language, voices.streamElements)
        ) {
          this.languageVoiceOptions =
            voices.streamElements[voiceSettings.language];
        }

        this.voiceControl.patchValue(voiceSettings.voice, { emitEvent: false });
      });

    this.languageControl.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((language) => {
        if (language === '') {
          this.languageVoiceOptions = [];
          return;
        }

        if (!isKeyOfObject(language, voices.streamElements)) {
          return;
        }

        this.languageVoiceOptions = voices.streamElements[language];

        this.configService.updateLanguage(language);
      });

    this.voiceControl.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((voice) => {
        this.configService.updateVoice(voice);
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
