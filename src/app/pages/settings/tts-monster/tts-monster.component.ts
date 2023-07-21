import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfigService } from 'src/app/shared/services/config.service';
import { InputComponent } from '../../../shared/components/input/input.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-tts-monster',
  templateUrl: './tts-monster.component.html',
  styleUrls: ['./tts-monster.component.scss'],
  standalone: true,
  imports: [InputComponent],
})
export class TtsMonsterComponent {
  overlay = new FormControl('', { nonNullable: true });
  ai = new FormControl(false, { nonNullable: true });

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
