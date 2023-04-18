import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TwitchService } from 'src/app/shared/services/twitch.service';
import { TwitchRedeemInfo } from 'src/app/shared/state/twitch/twitch.interface';

@Component({
  selector: 'app-redeems',
  templateUrl: './redeems.component.html',
  styleUrls: ['./redeems.component.scss'],
})
export class RedeemsComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  redeems: TwitchRedeemInfo[] = [];
  redeemControl = new FormControl('');
  redeemCharControl = new FormControl('');

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

    this.twitchService.redeem$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((redeem) => {
        this.redeemControl.setValue(redeem?.id ?? '');
      });

    this.twitchService.redeemCharLimit$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((redeemCharLimit) => {
        this.redeemCharControl.setValue(`${redeemCharLimit}`);
      });

    this.redeemCharControl.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((redeemCharLimit) => {
        this.twitchService.updateRedeemCharLimit(
          Number(redeemCharLimit) ?? 300
        );
      });

    this.redeemControl.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((redeem) => {
        const selectedRedeem = this.redeems.find((r) => r.id === redeem);
        this.twitchService.updateSelectedRedeem(selectedRedeem || null);
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
