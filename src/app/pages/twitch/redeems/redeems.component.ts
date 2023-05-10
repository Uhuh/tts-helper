import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, filter } from 'rxjs';
import { TwitchService } from 'src/app/shared/services/twitch.service';
import { TwitchRedeemInfo } from 'src/app/shared/state/twitch/twitch.interface';
import { nonNullFormControl } from 'src/app/shared/utils/form';
import { InputComponent } from '../../../shared/components/input/input.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-redeems',
  templateUrl: './redeems.component.html',
  styleUrls: ['./redeems.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ToggleComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    MatOptionModule,
    InputComponent,
  ],
})
export class RedeemsComponent {
  redeem = nonNullFormControl('');
  redeemCharLimitControl = nonNullFormControl(300, {
    validators: [Validators.min(0), Validators.pattern('^-?[0-9]+$')],
  });
  enabled = nonNullFormControl(true);

  redeems: TwitchRedeemInfo[] = [];

  constructor(private readonly twitchService: TwitchService) {
    /**
     * @TODO - Investigate glitch when authorizing and when this gets populated the inputs don't act like expected.
     * (with ref.detectChanges)
     */
    this.twitchService.redeems$
      .pipe(takeUntilDestroyed())
      .subscribe((redeems) => {
        this.redeems = redeems;
      });

    this.twitchService.redeemInfo$
      .pipe(takeUntilDestroyed())
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
      .pipe(takeUntilDestroyed())
      .subscribe((enabled) => {
        this.twitchService.updateRedeemEnabled(enabled);
      });

    this.redeem.valueChanges
      .pipe(
        takeUntilDestroyed(),
        debounceTime(1000),
        filter(() => this.redeem.valid)
      )
      .subscribe((redeem) => {
        this.twitchService.updateSelectedRedeem(redeem);
      });

    this.redeemCharLimitControl.valueChanges
      .pipe(
        takeUntilDestroyed(),
        debounceTime(1000),
        filter(() => this.redeemCharLimitControl.valid)
      )
      .subscribe((redeemCharLimitControl) => {
        this.twitchService.updateRedeemCharLimit(
          Number(redeemCharLimitControl)
        );
      });
  }
}
