import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, filter } from 'rxjs';
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
  standalone: true,
  imports: [
    ToggleComponent,
    NgIf,
    InputComponent,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    LabelBlockComponent,
    VariableTableComponent,
  ],
})
export class SubsComponent {
  private readonly twitchService = inject(TwitchService);

  readonly charLimit = new FormControl(300, {
    nonNullable: true,
    validators: [Validators.min(0), Validators.pattern('^-?[0-9]+$')],
  });
  readonly enabled = new FormControl(true, { nonNullable: true });
  readonly giftMessage = new FormControl('', { nonNullable: true });

  readonly variables: VariableTableOption[] = [
    { variable: 'amount', descriptor: 'The number of subs gifted' },
    { variable: 'username', descriptor: 'The username of the gifter' },
  ];

  constructor() {
    this.twitchService.subsInfo$
      .pipe(takeUntilDestroyed())
      .subscribe((subsInfo) => {
        this.charLimit.patchValue(subsInfo.subCharacterLimit, {
          emitEvent: false,
        });
        this.enabled.patchValue(subsInfo.enabled, { emitEvent: false });
        this.giftMessage.patchValue(subsInfo.giftMessage, { emitEvent: false });
      });

    this.enabled.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((enabled) => this.twitchService.updateSubEnabled(enabled));

    this.charLimit.valueChanges
      .pipe(
        takeUntilDestroyed(),
        debounceTime(1000),
        filter(() => this.charLimit.valid),
      )
      .subscribe((charLimit) =>
        this.twitchService.updateSubCharLimit(Number(charLimit)),
      );

    this.giftMessage.valueChanges
      .pipe(takeUntilDestroyed(), debounceTime(1000))
      .subscribe((giftMessage) =>
        this.twitchService.updateGiftMessage(giftMessage),
      );
  }
}
