import { Component, signal } from '@angular/core';
import { ConfigService } from '../../../shared/services/config.service';
import { nonNullFormControl } from '../../../shared/utils/form';
import voices from '../../../shared/json/amazon-polly.json';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface LanguageOptions {
  value: string;
  displayName: string;
}

@Component({
  selector: 'app-amazon-polly',
  templateUrl: './amazon-polly.component.html',
  styleUrls: ['./amazon-polly.component.scss'],
})
export class AmazonPollyComponent {
  regions = [...voices.regions];
  languageVoiceMap = new Map<string, LanguageOptions[]>();
  languageVoiceOptions = signal<LanguageOptions[]>([]);
  languageOptions = signal<string[]>([]);

  regionControl = nonNullFormControl(this.regions[0]);
  poolIdControl = nonNullFormControl('');
  languageControl = nonNullFormControl('');
  voiceControl = nonNullFormControl('');

  constructor(private readonly configService: ConfigService) {
    for (const voice of voices.voices) {
      this.languageVoiceMap.set(voice.language, voice.voices);
    }

    this.languageOptions.set([...this.languageVoiceMap.keys()]);

    this.languageVoiceOptions.set(
      this.languageVoiceMap.get(this.languageOptions()[0]) ?? []
    );

    this.configService.amazonPolly$
      .pipe(takeUntilDestroyed())
      .subscribe((amazonPolly) => {
        this.languageControl.patchValue(amazonPolly.language, {
          emitEvent: false,
        });

        this.languageVoiceOptions.set(
          this.languageVoiceMap.get(amazonPolly.language) ?? []
        );

        this.voiceControl.patchValue(amazonPolly.voice, { emitEvent: false });
        this.poolIdControl.patchValue(amazonPolly.poolId, { emitEvent: false });
        this.regionControl.patchValue(amazonPolly.region, { emitEvent: false });
      });

    this.languageControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((language) => {
        if (language === '') {
          this.languageVoiceOptions.set([]);
          return;
        }

        const options = this.languageVoiceMap.get(language);
        this.languageVoiceOptions.set(options ?? []);
        this.voiceControl.patchValue(
          this.languageVoiceOptions()[0].value ?? ''
        );

        this.configService.updateAmazonPollyLanguage(language);
      });

    this.regionControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((region) =>
        this.configService.updateAmazonPollyRegion(region)
      );

    this.poolIdControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((poolId) =>
        this.configService.updateAmazonPollyPoolId(poolId)
      );

    this.voiceControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((voice) => this.configService.updateAmazonPollyVoice(voice));
  }
}
