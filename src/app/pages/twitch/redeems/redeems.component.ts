import { Component } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, map } from 'rxjs';
import { TwitchService } from 'src/app/shared/services/twitch.service';
import { InputComponent } from '../../../shared/components/input/input.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { ConfigService } from '../../../shared/services/config.service';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { SelectorComponent } from '../../../shared/components/selector/selector.component';
import { TTSOption } from '../../../shared/components/tts-selector/tts-selector.component';

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
    LabelBlockComponent,
    SelectorComponent,
    AsyncPipe,
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

  redeems = this.twitchService.redeems$;
  redeemOptions = this.twitchService.redeems$
    .pipe(
      takeUntilDestroyed(),
      map(redeems => redeems.map<TTSOption>(r => ({ displayName: r.title, value: r.id })))
    );

  constructor(private readonly twitchService: TwitchService, private readonly configService: ConfigService) {
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
