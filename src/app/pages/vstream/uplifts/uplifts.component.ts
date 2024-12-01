import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  VariableTableComponent,
  VariableTableOption,
} from '../../../shared/components/variable-table/variable-table.component';
import { VStreamService } from '../../../shared/services/vstream.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VStreamEventVariables } from '../utils/variables';

@Component({
    selector: 'app-uplifts',
    imports: [CommonModule, LabelBlockComponent, ToggleComponent, ReactiveFormsModule, VariableTableComponent],
    templateUrl: './uplifts.component.html',
    styleUrl: './uplifts.component.scss'
})
export class UpliftsComponent {
  private readonly vstreamService = inject(VStreamService);
  readonly variables: VariableTableOption[] = VStreamEventVariables.uplifting_chat_sent.variables;

  readonly settings = new FormGroup({
    enabled: new FormControl(false, { nonNullable: true }),
    enabledGpt: new FormControl(false, { nonNullable: true }),
    enabledChat: new FormControl(false, { nonNullable: true }),
    customMessage: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.vstreamService.upliftSettings$
      .pipe(takeUntilDestroyed())
      .subscribe(settings => {
        this.settings.setValue(settings, { emitEvent: false });
      });

    this.settings.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(settings => {
        this.vstreamService.updateCustomMessageSettings(settings, 'uplift');
      });
  }
}
