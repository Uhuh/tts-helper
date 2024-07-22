import { Component, inject } from '@angular/core';
import { TwitchService } from '../../shared/services/twitch.service';
import { map } from 'rxjs';
import { TTSOption } from '../../shared/components/tts-selector/tts-selector.component';
import { AsyncPipe } from '@angular/common';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';
import { SelectorComponent } from '../../shared/components/selector/selector.component';
import { FormControl } from '@angular/forms';
import { ConfigService } from '../../shared/services/config.service';
import { UserAccordionComponent } from './user-accordion/user-accordion.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-tts-mapping',
  standalone: true,
  imports: [
    AsyncPipe,
    LabelBlockComponent,
    SelectorComponent,
    UserAccordionComponent,
    ButtonComponent,
  ],
  templateUrl: './tts-mapping.component.html',
  styleUrl: './tts-mapping.component.scss',
})
export class TtsMappingComponent {
  private readonly configService = inject(ConfigService);
  private readonly twitchService = inject(TwitchService);
  readonly customUserVoices$ = this.configService.customUserVoices$;

  readonly selectedRedeem = new FormControl('', { nonNullable: true });
  readonly redeems$ = this.twitchService.redeems$;
  readonly redeemOptions$ = this.redeems$
    .pipe(
      map(redeems => redeems.map<TTSOption>(r => ({
        displayName: r.title,
        value: r.id,
      })).concat([{ displayName: 'No redeem', value: '_' }])),
    );

  constructor() {
    this.configService.customUserVoiceRedeem$
      .pipe(takeUntilDestroyed())
      .subscribe(redeem => this.selectedRedeem.setValue(redeem, { emitEvent: false }));

    this.selectedRedeem.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(redeem => {
        this.configService.updateCustomUserVoiceRedeem(redeem);
      });
  }

  createCustomUserVoice() {
    this.configService.createCustomUserVoice();
  }
}

export default TtsMappingComponent;