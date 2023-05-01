import { Component, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Subject, debounceTime, filter, takeUntil } from 'rxjs';
import { TwitchService } from 'src/app/shared/services/twitch.service';
import { nonNullFormControl } from 'src/app/shared/utils/form';

@Component({
  selector: 'app-subs',
  templateUrl: './subs.component.html',
  styleUrls: ['./subs.component.scss'],
})
export class SubsComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  enabled = nonNullFormControl(true);
  charLimit = nonNullFormControl(300, {
    validators: [Validators.min(0), Validators.pattern('^-?[0-9]+$')],
  });

  giftMessage = nonNullFormControl('');

  constructor(private readonly twitchService: TwitchService) {}

  ngOnInit(): void {
    this.twitchService.subsInfo$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((subsInfo) => {
        this.charLimit.patchValue(subsInfo.subCharacterLimit, {
          emitEvent: false,
        });
        this.enabled.patchValue(subsInfo.enabled, { emitEvent: false });
        this.giftMessage.patchValue(subsInfo.giftMessage, { emitEvent: false });
      });

    this.enabled.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((enabled) => this.twitchService.updateSubEnabled(enabled));

    this.charLimit.valueChanges
      .pipe(
        takeUntil(this.destroyed$),
        debounceTime(1000),
        filter(() => this.charLimit.valid)
      )
      .subscribe((charLimit) =>
        this.twitchService.updateSubCharLimit(Number(charLimit))
      );

    this.giftMessage.valueChanges
      .pipe(takeUntil(this.destroyed$), debounceTime(1000))
      .subscribe((giftMessage) =>
        this.twitchService.updateGiftMessage(giftMessage)
      );
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
