import { Component, inject, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VStreamService } from '../../../../../shared/services/vstream.service';
import { ChoiceCommand } from '../../../../../shared/services/command.interface';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter } from 'rxjs';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { LabelBlockComponent } from '../../../../../shared/components/input-block/label-block.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ToggleComponent } from '../../../../../shared/components/toggle/toggle.component';
import {
  VariableTableComponent,
  VariableTableOption,
} from '../../../../../shared/components/variable-table/variable-table.component';
import { ChainCommandComponent } from '../chain-command/chain-command.component';

@Component({
    selector: 'app-choice-command',
    imports: [CommonModule, InputComponent, LabelBlockComponent, MatTabsModule, ReactiveFormsModule, ToggleComponent, VariableTableComponent, ChainCommandComponent],
    templateUrl: './choice-command.component.html',
    styleUrl: './choice-command.component.scss'
})
export class ChoiceCommandComponent implements OnChanges {
  private readonly vstreamService = inject(VStreamService);

  readonly variables: VariableTableOption[] = [
    { variable: 'value', descriptor: 'The result of the random chance.' },
  ];

  @Input({ required: true }) command!: ChoiceCommand;

  readonly settings = new FormGroup({
    command: new FormControl('', { nonNullable: true, validators: [Validators.minLength(1)] }),
    enabled: new FormControl(false, { nonNullable: true }),
    cooldown: new FormControl(0, { nonNullable: true }),
    options: new FormControl('', { nonNullable: true }),
    response: new FormControl('', { nonNullable: true }),
  });

  readonly permissions = new FormGroup({
    allUsers: new FormControl(false, { nonNullable: true }),
    mods: new FormControl(false, { nonNullable: true }),
    payingMembers: new FormControl(false, { nonNullable: true }),
  });

  constructor() {
    this.settings.valueChanges
      .pipe(filter(() => this.settings.valid))
      .subscribe(settings => {
        this.vstreamService.updateCommandSettings({
          ...settings,
          cooldown: Number(settings.cooldown),
          options: settings.options?.split(','),
          type: 'choice',
        }, this.command.id);
      });

    this.permissions.valueChanges
      .subscribe(settings => {
        this.vstreamService.updateCommandPermissions(settings, this.command.id);
      });
  }

  ngOnChanges() {
    const { id, type, permissions, options, chainCommands, ...settings } = this.command;

    this.settings.setValue({
      ...settings,
      options: options.join(','),
    }, { emitEvent: false });
    this.permissions.setValue(permissions, { emitEvent: false });
  }
}
