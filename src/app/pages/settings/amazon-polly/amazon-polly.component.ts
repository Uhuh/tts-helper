import { Component } from '@angular/core';
import { ConfigService } from '../../../shared/services/config.service';
import voices from '../../../shared/json/amazon-polly.json';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputComponent } from '../../../shared/components/input/input.component';
import { MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TtsSelectorComponent } from '../../../shared/components/tts-selector/tts-selector.component';

@Component({
  selector: 'app-amazon-polly',
  templateUrl: './amazon-polly.component.html',
  styleUrls: ['./amazon-polly.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    MatOptionModule,
    InputComponent,
    TtsSelectorComponent,
  ],
})
export class AmazonPollyComponent {
  regions = [...voices.regions];
  readonly voices = voices.options;

  regionControl = new FormControl(this.regions[0], { nonNullable: true });
  poolIdControl = new FormControl('', { nonNullable: true });
  languageControl = new FormControl('', { nonNullable: true });
  voiceControl = new FormControl('', { nonNullable: true });

  constructor(private readonly configService: ConfigService) {
    this.configService.amazonPolly$
      .pipe(takeUntilDestroyed())
      .subscribe((amazonPolly) => {
        this.languageControl.patchValue(amazonPolly.language, {
          emitEvent: false,
        });

        this.voiceControl.patchValue(amazonPolly.voice, { emitEvent: false });
        this.poolIdControl.patchValue(amazonPolly.poolId, { emitEvent: false });
        this.regionControl.patchValue(amazonPolly.region, { emitEvent: false });
      });

    this.languageControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((language) =>
        this.configService.updateAmazonPollyLanguage(language)
      );

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
