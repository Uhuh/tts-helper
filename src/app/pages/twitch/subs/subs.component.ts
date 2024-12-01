import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter } from 'rxjs';
import { TwitchService } from 'src/app/shared/services/twitch.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputComponent } from '../../../shared/components/input/input.component';
import { NgIf } from '@angular/common';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import {
  VariableTableComponent,
  VariableTableOption,
} from '../../../shared/components/variable-table/variable-table.component';

@Component({
    selector: 'app-subs',
    templateUrl: './subs.component.html',
    styleUrls: ['./subs.component.scss'],
    imports: [
        ToggleComponent,
        NgIf,
        InputComponent,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        LabelBlockComponent,
        VariableTableComponent,
    ]
})
export class SubsComponent {
  private readonly twitchService = inject(TwitchService);

  readonly renewSettings = new FormGroup({
    enabled: new FormControl(false, { nonNullable: true }),
    readMessageEnabled: new FormControl(false, { nonNullable: true }),
    customMessage: new FormControl('', { nonNullable: true }),
    characterLimit: new FormControl(300, {
      nonNullable: true,
      validators: [Validators.min(0), Validators.pattern('^-?[0-9]+$')],
    }),
  });

  readonly giftSettings = new FormGroup({
    enabled: new FormControl(false, { nonNullable: true }),
    readMessageEnabled: new FormControl(false, { nonNullable: true }),
    customMessage: new FormControl('', { nonNullable: true }),
    characterLimit: new FormControl(300, {
      nonNullable: true,
      validators: [Validators.min(0), Validators.pattern('^-?[0-9]+$')],
    }),
  });

  readonly giftVariables: VariableTableOption[] = [
    { variable: 'username', descriptor: 'The username of the gifter.' },
    { variable: 'amount', descriptor: 'The number of subs gifted.' },
    { variable: 'cumulative', descriptor: 'The number of total subs gifted by this user.' },
  ];

  readonly renewVariables: VariableTableOption[] = [
    { variable: 'username', descriptor: 'The username of the subscriber.' },
    { variable: 'tier', descriptor: 'The tier of the sub.' },
  ];

  constructor() {
    this.twitchService.subscriptions$
      .pipe(takeUntilDestroyed())
      .subscribe((subscriptions) => {
        this.renewSettings.setValue(subscriptions.renew, { emitEvent: false });
        this.giftSettings.setValue(subscriptions.gift, { emitEvent: false });
      });

    this.renewSettings.valueChanges
      .pipe(filter(() => this.renewSettings.valid), takeUntilDestroyed())
      .subscribe(partialSettings => this.twitchService.updateSubscriptions(partialSettings, 'renew'));

    this.giftSettings.valueChanges
      .pipe(filter(() => this.giftSettings.valid), takeUntilDestroyed())
      .subscribe(partialSettings => this.twitchService.updateSubscriptions(partialSettings, 'gift'));
  }
}
