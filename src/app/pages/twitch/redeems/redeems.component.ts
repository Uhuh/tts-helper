import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, map } from 'rxjs';
import { TwitchService } from 'src/app/shared/services/twitch.service';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { SelectorComponent } from '../../../shared/components/selector/selector.component';
import { TTSOption } from '../../../shared/components/tts-selector/tts-selector.component';
import { AsyncPipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { OpenAIService } from '../../../shared/services/openai.service';

@Component({
  selector: 'app-redeems',
  templateUrl: './redeems.component.html',
  styleUrls: ['./redeems.component.scss'],
  standalone: true,
  imports: [
    ToggleComponent,
    InputComponent,
    LabelBlockComponent,
    SelectorComponent,
    AsyncPipe,
    MatInputModule,
  ],
})
export class RedeemsComponent {
  private readonly twitchService = inject(TwitchService);
  private readonly openAIService = inject(OpenAIService);

  readonly redeemInfo = new FormGroup({
    enabled: new FormControl(true, { nonNullable: true }),
    redeem: new FormControl('', { nonNullable: true }),
    gptRedeem: new FormControl('', { nonNullable: true }),
    redeemCharacterLimit: new FormControl(300, {
      nonNullable: true,
      validators: [Validators.min(0), Validators.pattern('^-?[0-9]+$')],
    }),
  });

  readonly gptEnabled$ = this.openAIService.enabled$;
  readonly redeems$ = this.twitchService.redeems$;
  readonly redeemOptions$ = this.twitchService.redeems$
    .pipe(
      map(redeems => redeems.map<TTSOption>(r => ({ displayName: r.title, value: r.id }))),
    );

  constructor() {
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
