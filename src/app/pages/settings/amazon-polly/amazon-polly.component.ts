import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfigService } from '../../../shared/services/config.service';
import { Subject, takeUntil } from 'rxjs';
import { nonNullFormControl } from '../../../shared/utils/form';
import voices from '../../../shared/json/amazon-polly.json';
import { updateAmazonPollyLanguage } from '../../../shared/state/config/config.actions';

@Component({
  selector: 'app-amazon-polly',
  templateUrl: './amazon-polly.component.html',
  styleUrls: ['./amazon-polly.component.scss'],
})
export class AmazonPollyComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  regions = [...voices.regions];
  languageVoiceMap = new Map<
    string,
    { value: string; displayName: string }[]
  >();
  languageOptions: string[] = [];
  languageVoiceOptions: { value: string; displayName: string }[] = [];

  regionControl = nonNullFormControl('us-east-1');
  poolIdControl = nonNullFormControl('');
  languageControl = nonNullFormControl('');
  voiceControl = nonNullFormControl('');

  constructor(private readonly configService: ConfigService) {}
  ngOnInit() {
    for (const voice of voices.voices) {
      this.languageVoiceMap.set(voice.language, voice.voices);
    }

    this.languageOptions = [...this.languageVoiceMap.keys()];

    this.languageVoiceOptions =
      this.languageVoiceMap.get(this.languageOptions[0]) ?? [];

    this.configService.amazonPolly$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((amazonPolly) => {
        this.languageControl.patchValue(amazonPolly.language, {
          emitEvent: false,
        });

        this.languageVoiceOptions =
          this.languageVoiceMap.get(amazonPolly.language) ?? [];

        this.voiceControl.patchValue(amazonPolly.voice, { emitEvent: false });
        this.poolIdControl.patchValue(amazonPolly.poolId, { emitEvent: false });
        this.regionControl.patchValue(amazonPolly.region, { emitEvent: false });
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
        this.voiceControl.patchValue(this.languageVoiceOptions[0].value ?? '');

        this.configService.updateAmazonPollyLanguage(language);
      });

    this.regionControl.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((region) =>
        this.configService.updateAmazonPollyRegion(region)
      );

    this.poolIdControl.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((poolId) =>
        this.configService.updateAmazonPollyPoolId(poolId)
      );

    this.voiceControl.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((voice) => this.configService.updateAmazonPollyVoice(voice));
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
