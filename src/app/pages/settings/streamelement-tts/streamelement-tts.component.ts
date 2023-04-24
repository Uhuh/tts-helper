import { Subject, first, takeUntil } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { nonNullFormControl } from 'src/app/shared/utils/form';
import { ConfigService } from 'src/app/shared/services/config.service';
import voices from '../../../shared/json/stream-elements-options.json';

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

  languageVoiceMap = new Map<string, { key: string; displayName: string }[]>();
  languageOptions: string[] = [];
  languageVoiceOptions: TTSOption[] = [];

  voiceControl = nonNullFormControl('');
  languageControl = nonNullFormControl('');

  constructor(private readonly configService: ConfigService) {
    for (const voice of voices) {
      this.languageVoiceMap.set(
        voice.language,
        voice.options.sort((a, b) => {
          return ('' + a.displayName).localeCompare(b.displayName);
        })
      );
    }

    this.languageOptions = [...this.languageVoiceMap.keys()].sort();
  }

  ngOnInit(): void {
    this.configService.voiceSettings$
      .pipe(first(), takeUntil(this.destroyed$))
      .subscribe((voiceSettings) => {
        this.languageControl.patchValue(voiceSettings.language, {
          emitEvent: false,
        });

        this.languageVoiceOptions =
          this.languageVoiceMap.get(voiceSettings.language) ?? [];

        this.voiceControl.patchValue(voiceSettings.voice, { emitEvent: false });
      });

    this.languageControl.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((language) => {
        if (language === '') {
          this.languageVoiceOptions = [];
          return;
        }

        const options = this.languageVoiceMap.get(language);
        this.languageVoiceOptions = options ?? [];

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
