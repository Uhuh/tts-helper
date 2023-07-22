import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import {  FormGroup } from '@angular/forms';
import { ChatPermissionsFormGroup } from '../chat-settings.component';

@Component({
  selector: 'app-user-perms',
  standalone: true,
  imports: [CommonModule, ToggleComponent],
  templateUrl: './user-perms.component.html',
  styleUrls: ['./user-perms.component.scss']
})
export class UserPermsComponent {
  @Input({ required: true }) formGroup!: FormGroup<ChatPermissionsFormGroup>;
}
