import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, first, takeUntil } from 'rxjs';
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

  @Input() redeemsGroup!: FormGroup<{
    redeem: FormControl<string>;
    redeemCharLimit: FormControl<number>;
  }>;
  redeemCharLimitControl!: FormControl<number>;

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

    this.twitchService.twitchState$
      .pipe(first(), takeUntil(this.destroyed$))
      .subscribe((twitchState) => {
        this.redeemsGroup.patchValue({
          redeem: twitchState.redeem ?? '',
          redeemCharLimit: twitchState.redeemCharacterLimit,
        });
      });

    this.redeemCharLimitControl = this.redeemsGroup?.get(
      'redeemCharLimit'
    ) as FormControl<number>;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
