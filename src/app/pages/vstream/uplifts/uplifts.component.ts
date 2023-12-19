import { Component } from '@angular/core';
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

@Component({
  selector: 'app-uplifts',
  standalone: true,
  imports: [CommonModule, LabelBlockComponent, ToggleComponent, ReactiveFormsModule, VariableTableComponent],
  templateUrl: './uplifts.component.html',
  styleUrl: './uplifts.component.scss',
})
export class UpliftsComponent {
  readonly variables: VariableTableOption[] = [
    { variable: 'formatted', descriptor: 'The monetary value of the UpLift. (Ex $10)' },
    { variable: 'text', descriptor: 'The text the user included in the UpLift.' },
    { variable: 'username', descriptor: 'The user that sent the UpLift.' },
  ];

  settings = new FormGroup({
    enabled: new FormControl(false, { nonNullable: true }),
    enabledGpt: new FormControl(false, { nonNullable: true }),
    enabledChat: new FormControl(false, { nonNullable: true }),
    customMessage: new FormControl('', { nonNullable: true }),
  });

  constructor(private readonly vstreamService: VStreamService) {
    this.vstreamService.upliftSettings$
      .pipe(takeUntilDestroyed())
      .subscribe(settings => {
        this.settings.setValue(settings, { emitEvent: false });
      });

    this.settings.valueChanges
      .subscribe(settings => {
        this.vstreamService.updateCustomMessageSettings(settings, 'uplift');
      });
  }
}
