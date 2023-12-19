import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../../shared/components/input/input.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import {
  VariableTableComponent,
  VariableTableOption,
} from '../../../shared/components/variable-table/variable-table.component';
import { VStreamService } from '../../../shared/services/vstream.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, InputComponent, LabelBlockComponent, ReactiveFormsModule, ToggleComponent, VariableTableComponent],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss',
})
export class SubscriptionComponent {
  readonly renewVariables: VariableTableOption[] = [
    { variable: 'streakMonth', descriptor: 'The current subscription streak.' },
    { variable: 'renewalMonth', descriptor: 'The number of months the user has subscribed.' },
    { variable: 'tier', descriptor: 'The tier of the subscription.' },
    { variable: 'text', descriptor: 'The text the user included in the subscription.' },
    { variable: 'username', descriptor: 'The user that subscribed.' },
  ];

  readonly giftedVariables: VariableTableOption[] = [
    { variable: 'tier', descriptor: 'The tier of the gift.' },
    { variable: 'amount', descriptor: 'The number of gifts the user gifted.' },
    { variable: 'gifter', descriptor: 'The user that gifted subscriptions.' },
  ];

  renewSettings = new FormGroup({
    enabled: new FormControl(false, { nonNullable: true }),
    enabledGpt: new FormControl(false, { nonNullable: true }),
    enabledChat: new FormControl(false, { nonNullable: true }),
    customMessage: new FormControl('', { nonNullable: true }),
  });

  giftedSettings = new FormGroup({
    enabled: new FormControl(false, { nonNullable: true }),
    enabledGpt: new FormControl(false, { nonNullable: true }),
    enabledChat: new FormControl(false, { nonNullable: true }),
    customMessage: new FormControl('', { nonNullable: true }),
  });

  constructor(private readonly vstreamService: VStreamService) {
    this.vstreamService.subscriptionSettings$
      .pipe(takeUntilDestroyed())
      .subscribe(settings => {
        this.renewSettings.setValue(settings.renew, { emitEvent: false });
        this.giftedSettings.setValue(settings.gifted, { emitEvent: false });
      });

    this.renewSettings.valueChanges
      .subscribe(settings => {
        this.vstreamService.updateCustomMessageSettings(settings, 'sub-renew');
      });

    this.giftedSettings.valueChanges
      .subscribe(settings => {
        this.vstreamService.updateCustomMessageSettings(settings, 'sub-gifted');
      });
  }
}
