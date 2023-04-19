import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, debounceTime, filter, takeUntil } from 'rxjs';
import { TwitchService } from '../../shared/services/twitch.service';
import { listen } from '@tauri-apps/api/event';
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
    });

    this.redeemsGroup.valueChanges
      .pipe(
        takeUntil(this.destroyed$),
        debounceTime(1000),
        filter(() => this.redeemsGroup.valid)
      )
      .subscribe((redeemsGroup) => {
        if (
          redeemsGroup.redeem === undefined ||
          redeemsGroup.redeemCharLimit === undefined
        ) {
          console.info('Submitted redeemsGroup', redeemsGroup);
          throw new Error('FormGroup submitted null values.');
        }

        this.twitchService.updateSelectedRedeem(redeemsGroup.redeem);
        this.twitchService.updateRedeemCharLimit(
          Number(redeemsGroup.redeemCharLimit)
        );
      });
  }

  get isFormPristine() {
    return this.redeemsGroup.pristine && this.bitsGroup.pristine;
  }

  submit() {
    console.log('helooo');
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
