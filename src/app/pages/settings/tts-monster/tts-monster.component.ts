import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfigService } from 'src/app/shared/services/config.service';
import { nonNullFormControl } from 'src/app/shared/utils/form';

@Component({
  selector: 'app-tts-monster',
  templateUrl: './tts-monster.component.html',
  styleUrls: ['./tts-monster.component.scss'],
})
export class TtsMonsterComponent {
  overlay = nonNullFormControl('');
  ai = nonNullFormControl(false);

  constructor(private readonly configService: ConfigService) {
    this.configService.ttsMonster$
      .pipe(takeUntilDestroyed())
      .subscribe((ttsMonster) => {
        this.overlay.patchValue(ttsMonster.overlay, { emitEvent: false });
        this.ai.patchValue(ttsMonster.ai, { emitEvent: false });
      });

    this.overlay.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((overlay) => {
        let [key, userId] = overlay.split('/').reverse();

        // If one is invalid then make both empty string.
        if (!key || !userId) {
          key = '';
          userId = '';
        }

        this.configService.updateTtsMonsterOverlayInfo({
          key,
          userId,
          overlay,
        });
      });
  }
}
