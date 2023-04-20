import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { ConfigService } from 'src/app/shared/services/config.service';
import { nonNullFormControl } from 'src/app/shared/utils/form';

@Component({
  selector: 'app-moderation',
  templateUrl: './moderation.component.html',
  styleUrls: ['./moderation.component.scss'],
})
export class ModerationComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  // Just to prevent streamers from showing bad words on stream
  hideBannedWords = nonNullFormControl(true);
  bannedWords = nonNullFormControl('');

  constructor(private readonly configService: ConfigService) {}

  ngOnInit(): void {
    this.configService.bannedWords$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((bannedWords) => {
        this.bannedWords.patchValue(bannedWords.join(','));
      });

    this.bannedWords.valueChanges
      .pipe(takeUntil(this.destroyed$), debounceTime(1000))
      .subscribe((bannedWords) => {
        this.configService.updateBannedWords(bannedWords);
      });
  }

  ngOnDestroy(): void {}
}
