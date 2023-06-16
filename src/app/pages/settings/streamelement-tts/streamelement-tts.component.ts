import { Component } from '@angular/core';
import { nonNullFormControl } from 'src/app/shared/utils/form';
import { ConfigService } from 'src/app/shared/services/config.service';
import voices from '../../../shared/json/stream-elements.json';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TtsSelectorComponent } from '../../../shared/components/tts-selector/tts-selector.component';

export interface TTSOption {
  key: string;
  displayName: string;
}

@Component({
  selector: 'app-streamelement-tts',
  templateUrl: './streamelement-tts.component.html',
  styleUrls: ['./streamelement-tts.component.scss'],
  standalone: true,
  imports: [TtsSelectorComponent],
})
export class StreamelementTtsComponent {
  readonly voices = voices;
  voiceControl = nonNullFormControl('');
  languageControl = nonNullFormControl('');

  constructor(private readonly configService: ConfigService) {
    this.configService.streamElements$
      .pipe(takeUntilDestroyed())
      .subscribe((streamElements) => {
        this.languageControl.patchValue(streamElements.language, {
          emitEvent: false,
        });

        this.voiceControl.patchValue(streamElements.voice, {
          emitEvent: false,
        });
      });

    this.languageControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((language) =>
        this.configService.updateStreamElementsLanguage(language)
      );

    this.voiceControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((voice) => this.configService.updateVoice(voice));
  }
}
