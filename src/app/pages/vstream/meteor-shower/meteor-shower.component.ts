import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import {
  VariableTableComponent,
  VariableTableOption,
} from '../../../shared/components/variable-table/variable-table.component';
import { VStreamService } from '../../../shared/services/vstream.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VStreamEventVariables } from '../utils/variables';

@Component({
  selector: 'app-meteor-shower',
  standalone: true,
  imports: [CommonModule, LabelBlockComponent, InputComponent, ToggleComponent, ReactiveFormsModule, VariableTableComponent],
  templateUrl: './meteor-shower.component.html',
  styleUrl: './meteor-shower.component.scss',
})
export class MeteorShowerComponent {
  private readonly vstreamService = inject(VStreamService);

  readonly variables: VariableTableOption[] = VStreamEventVariables.shower_received.variables;
  readonly settings = new FormGroup({
    enabled: new FormControl(false, { nonNullable: true }),
    enabledGpt: new FormControl(false, { nonNullable: true }),
    enabledChat: new FormControl(false, { nonNullable: true }),
    customMessage: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.vstreamService.meteorShowerSettings$
      .pipe(takeUntilDestroyed())
      .subscribe(settings => {
        this.settings.setValue(settings, { emitEvent: false });
      });

    this.settings.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(settings => {
        this.vstreamService.updateCustomMessageSettings(settings, 'meteor');
      });
  }
}
