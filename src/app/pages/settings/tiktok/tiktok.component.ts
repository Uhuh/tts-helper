import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { nonNullFormControl } from 'src/app/shared/utils/form';
import { ConfigService } from 'src/app/shared/services/config.service';
import voices from '../../../shared/json/tiktok.json';
import { TtsSelectorComponent } from '../../../shared/components/tts-selector/tts-selector.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-tiktok',
  standalone: true,
  templateUrl: './tiktok.component.html',
  styleUrls: ['./tiktok.component.scss'],
  imports: [CommonModule, TtsSelectorComponent],
})
export class TiktokComponent {
  readonly voices = voices;
  voiceControl = nonNullFormControl('');
  languageControl = nonNullFormControl('');

  constructor(private readonly configService: ConfigService) {
    this.configService.tikTok$
      .pipe(takeUntilDestroyed())
      .subscribe((tikTok) => {
        this.languageControl.patchValue(tikTok.language, {
          emitEvent: false,
        });

        this.voiceControl.patchValue(tikTok.voice, {
          emitEvent: false,
        });
      });

    this.languageControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((language) =>
        this.configService.updateTikTokLanguage(language)
      );

    this.voiceControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((voice) => this.configService.updateTikTokVoice(voice));
  }

  updateVoice() {}
}
