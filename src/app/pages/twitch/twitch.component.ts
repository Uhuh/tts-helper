import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TwitchService } from '../../shared/services/twitch.service';
import { listen } from '@tauri-apps/api/event';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { TwitchRedeemInfo } from 'src/app/shared/state/twitch/twitch.interface';

@Component({
  selector: 'app-twitch',
  templateUrl: './twitch.component.html',
  styleUrls: ['./twitch.component.scss'],
})
export class TwitchComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  redeems: TwitchRedeemInfo[] = [];

  bitsControl = new FormControl('');
  bitsCharControl = new FormControl('');

  redeemControl = new FormControl('');
  redeemCharControl = new FormControl('');

  constructor(
    private readonly twitchService: TwitchService,
    private readonly snackbar: MatSnackBar,
    private readonly ref: ChangeDetectorRef
  ) {}

  ngOnInit() {
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

    listen('access-token', (authData) => {
      const { token, provider } = authData.payload as {
        token: string;
        provider: 'twitch' | 'youtube';
      };

      if (provider !== 'twitch') {
        return;
      }

      this.twitchService.updateToken(token);
    }).catch((e) => {
      console.error('Encountered issue getting access token.', e);

      this.snackbar.open(
        'Oops! We encountered an error while authorizing...',
        'Dismiss',
        {
          panelClass: 'notification-error',
        }
      );
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
