import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatCommand } from '../../../../shared/services/chat.interface';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { LabelBlockComponent } from '../../../../shared/components/input-block/label-block.component';
import { ToggleComponent } from '../../../../shared/components/toggle/toggle.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { InputComponent } from '../../../../shared/components/input/input.component';

@Component({
  selector: 'app-edit-command',
  standalone: true,
  imports: [CommonModule, CdkAccordionModule, LabelBlockComponent, ToggleComponent, MatIconModule, ReactiveFormsModule, InputComponent],
  templateUrl: './edit-command.component.html',
  styleUrl: './edit-command.component.scss',
})
export class EditCommandComponent {
  @Input({ required: true }) command!: ChatCommand;

  enabled = new FormControl(true, { nonNullable: true });
  commandMessage = new FormControl('', { nonNullable: true });
  cooldown = new FormControl(0, { nonNullable: true });
  permissions = new FormGroup({
    allUsers: new FormControl(false, { nonNullable: true }),
    mods: new FormControl(false, { nonNullable: true }),
    payingMembers: new FormControl(false, { nonNullable: true }),
  });
}
