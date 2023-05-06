import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { ConfigService } from 'src/app/shared/services/config.service';
import { nonNullFormControl } from 'src/app/shared/utils/form';

@Component({
  selector: 'app-moderation',
  templateUrl: './moderation.component.html',
  styleUrls: ['./moderation.component.scss'],
})
export class ModerationComponent {
  // Just to prevent streamers from showing bad words on stream
  hideBannedWords = nonNullFormControl(true);
  bannedWords = nonNullFormControl('');

  constructor(private readonly configService: ConfigService) {
    this.configService.bannedWords$
      .pipe(takeUntilDestroyed())
      .subscribe((bannedWords) => {
        this.bannedWords.patchValue(bannedWords.join(','), {
          emitEvent: false,
        });
      });

    this.bannedWords.valueChanges
      .pipe(takeUntilDestroyed(), debounceTime(1000))
      .subscribe((bannedWords) => {
        this.configService.updateBannedWords(bannedWords.toLowerCase());
      });
  }
}
