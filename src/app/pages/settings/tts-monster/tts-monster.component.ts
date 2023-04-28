import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { ConfigService } from 'src/app/shared/services/config.service';
import { nonNullFormControl } from 'src/app/shared/utils/form';

@Component({
  selector: 'app-tts-monster',
  templateUrl: './tts-monster.component.html',
  styleUrls: ['./tts-monster.component.scss'],
})
export class TtsMonsterComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  overlay = nonNullFormControl('');
  ai = nonNullFormControl(false);

  constructor(private readonly configService: ConfigService) {}

  ngOnInit(): void {
    this.configService.ttsMonster$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((ttsMonster) => {
        this.overlay.patchValue(ttsMonster.overlay, { emitEvent: false });
        this.ai.patchValue(ttsMonster.ai, { emitEvent: false });
      });

    this.ai.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((ai) => {
      this.configService.updateTtsMonsterAi(ai);
    });

    this.overlay.valueChanges
      .pipe(takeUntil(this.destroyed$), debounceTime(500))
      .subscribe((overlay) => {
        let [key, userId] = overlay.split('/').reverse();

        console.log(key, userId, overlay.split('/').reverse());

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

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
