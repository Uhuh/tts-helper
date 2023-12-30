import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  selector: 'app-followers',
  standalone: true,
  imports: [CommonModule, LabelBlockComponent, ReactiveFormsModule, ToggleComponent, VariableTableComponent],
  templateUrl: './followers.component.html',
  styleUrl: './followers.component.scss',
})
export class FollowersComponent {
  readonly variables: VariableTableOption[] = VStreamEventVariables.new_follower.variables;

  settings = new FormGroup({
    enabled: new FormControl(false, { nonNullable: true }),
    enabledGpt: new FormControl(false, { nonNullable: true }),
    enabledChat: new FormControl(false, { nonNullable: true }),
    customMessage: new FormControl('', { nonNullable: true }),
  });

  constructor(private readonly vstreamService: VStreamService) {
    this.vstreamService.followerSettings$
      .pipe(takeUntilDestroyed())
      .subscribe(settings => {
        this.settings.setValue(settings, { emitEvent: false });
      });

    this.settings.valueChanges
      .subscribe(settings => {
        this.vstreamService.updateCustomMessageSettings(settings, 'follower');
      });
  }
}
