import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatCommand } from '../../../../shared/services/chat.interface';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { LabelBlockComponent } from '../../../../shared/components/input-block/label-block.component';
import { ToggleComponent } from '../../../../shared/components/toggle/toggle.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { VStreamService } from '../../../../shared/services/vstream.service';
import { filter } from 'rxjs';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-edit-command',
  standalone: true,
  imports: [CommonModule, CdkAccordionModule, LabelBlockComponent, ToggleComponent, MatIconModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './edit-command.component.html',
  styleUrl: './edit-command.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCommandComponent implements OnInit {
  @Input({ required: true }) command!: ChatCommand;

  commandSettings = new FormGroup({
    command: new FormControl('', { nonNullable: true, validators: [Validators.minLength(1)] }),
    enabled: new FormControl(false, { nonNullable: true }),
    autoRedeem: new FormControl(false, { nonNullable: true }),
    autoRedeemInterval: new FormControl(0, { nonNullable: true }),
    response: new FormControl('', { nonNullable: true }),
    cooldown: new FormControl(0, { nonNullable: true }),
  });

  permissions = new FormGroup({
    allUsers: new FormControl(false, { nonNullable: true }),
    mods: new FormControl(false, { nonNullable: true }),
    payingMembers: new FormControl(false, { nonNullable: true }),
  });

  constructor(private readonly vstreamService: VStreamService) {
    this.commandSettings.valueChanges
      .pipe(filter(() => this.commandSettings.valid))
      .subscribe(settings => {
        this.vstreamService.updateCommandSettings({
          ...settings,
          cooldown: Number(settings.cooldown),
          autoRedeemInterval: Number(settings.autoRedeemInterval),
        }, this.command.id);
      });

    this.permissions.valueChanges
      .subscribe(settings => {
        this.vstreamService.updateCommandPermissions(settings, this.command.id);
      });
  }

  ngOnInit() {
    const { id, permissions, ...settings } = this.command;

    this.commandSettings.setValue(settings, { emitEvent: false });
    this.permissions.setValue(permissions, { emitEvent: false });
  }

  deleteCommand() {
    this.vstreamService.deleteCommand(this.command.id);
  }
}
