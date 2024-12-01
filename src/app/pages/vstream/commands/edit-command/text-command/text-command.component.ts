import { Component, inject, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { LabelBlockComponent } from '../../../../../shared/components/input-block/label-block.component';
import { MatTabsModule } from '@angular/material/tabs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToggleComponent } from '../../../../../shared/components/toggle/toggle.component';
import { VStreamService } from '../../../../../shared/services/vstream.service';
import { filter } from 'rxjs';
import { ChatCommand } from '../../../../../shared/services/command.interface';
import { ChainCommandComponent } from '../chain-command/chain-command.component';

@Component({
  selector: 'app-text-command',
  imports: [CommonModule, InputComponent, LabelBlockComponent, MatTabsModule, ReactiveFormsModule, ToggleComponent, ChainCommandComponent],
  templateUrl: './text-command.component.html',
  styleUrl: './text-command.component.scss',
})
export class TextCommandComponent implements OnChanges {
  private readonly vstreamService = inject(VStreamService);

  @Input({ required: true }) command!: ChatCommand;

  readonly settings = new FormGroup({
    command: new FormControl('', { nonNullable: true, validators: [Validators.minLength(1)] }),
    enabled: new FormControl(false, { nonNullable: true }),
    autoRedeem: new FormControl(false, { nonNullable: true }),
    autoRedeemInterval: new FormControl(0, { nonNullable: true }),
    response: new FormControl('', { nonNullable: true }),
    cooldown: new FormControl(0, { nonNullable: true }),
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
          autoRedeemInterval: Number(settings.autoRedeemInterval),
          type: 'chat',
        }, this.command.id);
      });

    this.permissions.valueChanges
      .subscribe(settings => {
        this.vstreamService.updateCommandPermissions(settings, this.command.id);
      });
  }

  ngOnChanges() {
    const { id, type, permissions, chainCommands, ...settings } = this.command;

    this.settings.setValue(settings, { emitEvent: false });
    this.permissions.setValue(permissions, { emitEvent: false });
  }
}
