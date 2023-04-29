import { Subject, takeUntil } from 'rxjs';
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

  languageVoiceMap = new Map<string, TTSOption[]>();
  languageOptions: string[] = [];
  languageVoiceOptions: TTSOption[] = [];

  voiceControl = nonNullFormControl('');
  languageControl = nonNullFormControl('');

  constructor(private readonly configService: ConfigService) {}

  ngOnInit(): void {
    for (const voice of voices) {
      this.languageVoiceMap.set(voice.language, voice.options);
    }

    this.languageOptions = [...this.languageVoiceMap.keys()];
    
    this.configService.streamElements$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((streamElements) => {
        this.languageControl.patchValue(streamElements.language, {
          emitEvent: false,
        });

        this.languageVoiceOptions =
          this.languageVoiceMap.get(streamElements.language) ?? [];

        this.voiceControl.patchValue(streamElements.voice, { emitEvent: false });
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
        this.voiceControl.patchValue(this.languageVoiceOptions[0].key ?? '');

        this.configService.updateStreamElementsLanguage(language);
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
