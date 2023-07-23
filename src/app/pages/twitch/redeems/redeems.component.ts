import { Component } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { TwitchService } from 'src/app/shared/services/twitch.service';
import { InputComponent } from '../../../shared/components/input/input.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import { NgFor, NgIf } from '@angular/common';
import { TwitchRedeemInfo } from '../../../shared/state/twitch/twitch.feature';
import { ConfigService } from '../../../shared/services/config.service';

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
  redeemInfo = new FormGroup({
    enabled: new FormControl(true, { nonNullable: true }),
    redeem: new FormControl('', { nonNullable: true }),
    gptRedeem: new FormControl('', { nonNullable: true }),
    redeemCharacterLimit: new FormControl(300, {
      nonNullable: true,
      validators: [Validators.min(0), Validators.pattern('^-?[0-9]+$')],
    }),
  });

  gptEnabled = toSignal(this.configService.gptEnabled$);

  redeems: TwitchRedeemInfo[] = [];

  constructor(private readonly twitchService: TwitchService, private readonly configService: ConfigService) {
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
        this.redeemInfo.setValue(redeemInfo, { emitEvent: false });
      });


    this.redeemInfo.valueChanges
      .pipe(takeUntilDestroyed(), debounceTime(500))
      .subscribe(redeemInfo => {
        this.twitchService.updateRedeemInfo(redeemInfo);
      });
  }
}
