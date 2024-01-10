import { Component, inject, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { LabelBlockComponent } from '../../../../../shared/components/input-block/label-block.component';
import { MatTabsModule } from '@angular/material/tabs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToggleComponent } from '../../../../../shared/components/toggle/toggle.component';
import { VariableTableComponent } from '../../../../../shared/components/variable-table/variable-table.component';
import { VStreamService } from '../../../../../shared/services/vstream.service';
import { SoundCommand } from '../../../../../shared/services/command.interface';
import { filter } from 'rxjs';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { ChainCommandComponent } from '../chain-command/chain-command.component';

@Component({
  selector: 'app-sound-command',
  standalone: true,
  imports: [CommonModule, InputComponent, LabelBlockComponent, MatTabsModule, ReactiveFormsModule, ToggleComponent, VariableTableComponent, ButtonComponent, ChainCommandComponent],
  templateUrl: './sound-command.component.html',
  styleUrl: './sound-command.component.scss',
})
export class SoundCommandComponent implements OnChanges {
  private readonly vstreamService = inject(VStreamService);

  @Input({ required: true }) command!: SoundCommand;

  readonly settings = new FormGroup({
    command: new FormControl('', { nonNullable: true, validators: [Validators.minLength(1)] }),
    enabled: new FormControl(false, { nonNullable: true }),
    cooldown: new FormControl(0, { nonNullable: true }),
    fileURL: new FormControl('', { nonNullable: true }),
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
          type: 'sound',
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

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement & EventTarget)?.files?.[0] ?? null;

    if (!file) {
      return;
    }

    const fileURL = await this.toBase64(file);

    if (typeof fileURL !== 'string') {
      return;
    }

    this.settings.controls.fileURL.setValue(fileURL);
  }

  toBase64(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  }
}
