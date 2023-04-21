import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, debounceTime, filter, takeUntil } from 'rxjs';
import { TwitchService } from '../../shared/services/twitch.service';
import { FormGroup, Validators } from '@angular/forms';
import { nonNullFormControl } from 'src/app/shared/utils/form';

@Component({
  selector: 'app-twitch',
  templateUrl: './twitch.component.html',
  styleUrls: ['./twitch.component.scss'],
})
export class TwitchComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  redeemsGroup = new FormGroup({
    redeem: nonNullFormControl(''),
    redeemCharLimit: nonNullFormControl(300, {
      validators: [Validators.min(0), Validators.pattern('^-?[0-9]+$')],
    }),
  });

  bitsGroup = new FormGroup({
    bits: nonNullFormControl(0, {
      validators: [Validators.min(0), Validators.pattern('^-?[0-9]+$')],
    }),
    bitsCharLimit: nonNullFormControl(300, { validators: [Validators.min(0)] }),
  });

  constructor(private readonly twitchService: TwitchService) {}

  ngOnInit() {
    this.redeemsGroup.valueChanges
      .pipe(
        takeUntil(this.destroyed$),
        debounceTime(1000),
        filter(() => this.redeemsGroup.valid && !this.redeemsGroup.pristine)
      )
      .subscribe((redeemsGroup) => {
        if (
          redeemsGroup.redeem === undefined ||
          redeemsGroup.redeemCharLimit === undefined
        ) {
          console.info('Incorrectly submitted redeemsGroup', redeemsGroup);
          throw new Error('FormGroup submitted undefined values.');
        }

        this.redeemsGroup.markAsPristine();
        this.twitchService.updateSelectedRedeem(redeemsGroup.redeem);
        this.twitchService.updateRedeemCharLimit(
          Number(redeemsGroup.redeemCharLimit)
        );
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
