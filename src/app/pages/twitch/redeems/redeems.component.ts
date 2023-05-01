import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, combineLatest, debounceTime, filter, takeUntil } from 'rxjs';
import { TwitchService } from 'src/app/shared/services/twitch.service';
import { TwitchRedeemInfo } from 'src/app/shared/state/twitch/twitch.interface';
import { nonNullFormControl } from 'src/app/shared/utils/form';

@Component({
  selector: 'app-redeems',
  templateUrl: './redeems.component.html',
  styleUrls: ['./redeems.component.scss'],
})
export class RedeemsComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  redeem = nonNullFormControl('');
  redeemCharLimitControl = nonNullFormControl(300, {
    validators: [Validators.min(0), Validators.pattern('^-?[0-9]+$')],
  });
  enabled = nonNullFormControl(true);

  redeems: TwitchRedeemInfo[] = [];

  constructor(private readonly twitchService: TwitchService) {}

  ngOnInit(): void {
    /**
     * @TODO - Investigate glitch when authorizing and when this gets populated the inputs don't act like expected.
     * (with ref.detectChanges)
     */
    this.twitchService.redeems$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((redeems) => {
        this.redeems = redeems;
      });

    this.twitchService.redeemInfo$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((redeemInfo) => {
        this.redeem.patchValue(redeemInfo.redeem ?? '', { emitEvent: false });
        this.redeemCharLimitControl.patchValue(
          redeemInfo.redeemCharacterLimit,
          {
            emitEvent: false,
          }
        );
        this.enabled.patchValue(redeemInfo.enabled, { emitEvent: false });
      });

    this.enabled.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((enabled) => {
        this.twitchService.updateRedeemEnabled(enabled);
      });

    this.redeem.valueChanges
      .pipe(
        takeUntil(this.destroyed$),
        debounceTime(1000),
        filter(() => this.redeem.valid)
      )
      .subscribe((redeem) => {
        this.twitchService.updateSelectedRedeem(redeem);
      });

    this.redeemCharLimitControl.valueChanges
      .pipe(
        takeUntil(this.destroyed$),
        debounceTime(1000),
        filter(() => this.redeemCharLimitControl.valid)
      )
      .subscribe((redeemCharLimitControl) => {
        this.twitchService.updateRedeemCharLimit(
          Number(redeemCharLimitControl)
        );
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
