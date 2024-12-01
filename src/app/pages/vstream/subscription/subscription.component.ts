import { Component, inject } from '@angular/core';
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
import { VStreamEventVariables } from '../utils/variables';

@Component({
    selector: 'app-subscription',
    imports: [CommonModule, InputComponent, LabelBlockComponent, ReactiveFormsModule, ToggleComponent, VariableTableComponent],
    templateUrl: './subscription.component.html',
    styleUrl: './subscription.component.scss'
})
export class SubscriptionComponent {
  private readonly vstreamService = inject(VStreamService);
  readonly renewVariables: VariableTableOption[] = VStreamEventVariables.subscription_renewed.variables;
  readonly giftedVariables: VariableTableOption[] = VStreamEventVariables.subscriptions_gifted.variables;

  readonly renewSettings = new FormGroup({
    enabled: new FormControl(false, { nonNullable: true }),
    enabledGpt: new FormControl(false, { nonNullable: true }),
    enabledChat: new FormControl(false, { nonNullable: true }),
    customMessage: new FormControl('', { nonNullable: true }),
  });

  readonly giftedSettings = new FormGroup({
    enabled: new FormControl(false, { nonNullable: true }),
    enabledGpt: new FormControl(false, { nonNullable: true }),
    enabledChat: new FormControl(false, { nonNullable: true }),
    customMessage: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.vstreamService.subscriptionSettings$
      .pipe(takeUntilDestroyed())
      .subscribe(settings => {
        this.renewSettings.setValue(settings.renew, { emitEvent: false });
        this.giftedSettings.setValue(settings.gifted, { emitEvent: false });
      });

    this.renewSettings.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(settings => {
        this.vstreamService.updateCustomMessageSettings(settings, 'sub-renew');
      });

    this.giftedSettings.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(settings => {
        this.vstreamService.updateCustomMessageSettings(settings, 'sub-gifted');
      });
  }
}
