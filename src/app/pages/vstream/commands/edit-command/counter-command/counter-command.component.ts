import { Component, inject, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { LabelBlockComponent } from '../../../../../shared/components/input-block/label-block.component';
import { MatTabsModule } from '@angular/material/tabs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToggleComponent } from '../../../../../shared/components/toggle/toggle.component';
import { VStreamService } from '../../../../../shared/services/vstream.service';
import { CounterCommand } from '../../../../../shared/services/command.interface';
import { filter } from 'rxjs';
import {
  VariableTableComponent,
  VariableTableOption,
} from '../../../../../shared/components/variable-table/variable-table.component';
import { ChainCommandComponent } from '../chain-command/chain-command.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-counter-command',
  standalone: true,
  imports: [CommonModule, InputComponent, LabelBlockComponent, MatTabsModule, ReactiveFormsModule, ToggleComponent, VariableTableComponent, ChainCommandComponent],
  templateUrl: './counter-command.component.html',
  styleUrl: './counter-command.component.scss',
})
export class CounterCommandComponent implements OnChanges {
  private readonly vstreamService = inject(VStreamService);
  readonly variables: VariableTableOption[] = [
    { variable: 'value', descriptor: 'The current value of the counter' },
  ];

  @Input({ required: true }) command!: CounterCommand;

  readonly settings = new FormGroup({
    command: new FormControl('', { nonNullable: true, validators: [Validators.minLength(1)] }),
    enabled: new FormControl(false, { nonNullable: true }),
    cooldown: new FormControl(0, { nonNullable: true }),
    amount: new FormControl(0, { nonNullable: true }),
    value: new FormControl(0, { nonNullable: true }),
    response: new FormControl('', { nonNullable: true }),
    resetOnLaunch: new FormControl(false, { nonNullable: true }),
  });

  readonly permissions = new FormGroup({
    allUsers: new FormControl(false, { nonNullable: true }),
    mods: new FormControl(false, { nonNullable: true }),
    payingMembers: new FormControl(false, { nonNullable: true }),
  });

  constructor() {
    this.settings.valueChanges
      .pipe(
        takeUntilDestroyed(),
        filter(() => this.settings.valid),
      )
      .subscribe(settings => {
        this.vstreamService.updateCommandSettings({
          ...settings,
          cooldown: Number(settings.cooldown),
          value: Number(settings.value),
          amount: Number(settings.amount),
          type: 'counter',
        }, this.command.id);
      });

    this.permissions.valueChanges
      .subscribe(settings => {
        this.vstreamService.updateCommandPermissions(settings, this.command.id);
      });
  }

  ngOnChanges() {
    const { id, type, permissions, chainCommands, ...settings } = this.command;

    this.settings.setValue({
      ...settings,
    }, { emitEvent: false });
    this.permissions.setValue(permissions, { emitEvent: false });
  }
}
