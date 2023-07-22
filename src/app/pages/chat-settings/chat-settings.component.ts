import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../shared/components/input/input.component';
import { UserPermsComponent } from './user-perms/user-perms.component';
import { FormControl, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfigService } from '../../shared/services/config.service';
import { ToggleComponent } from '../../shared/components/toggle/toggle.component';

export interface ChatPermissionsFormGroup {
  allUsers: FormControl<boolean>;
  mods: FormControl<boolean>;
  payingMembers: FormControl<boolean>;
}

export interface ChatSettingsFormGroup {
  enabled: FormControl<boolean>;
  command: FormControl<string>;
  cooldown: FormControl<number>;
  permissions: FormGroup<ChatPermissionsFormGroup>;
}

@Component({
  selector: 'app-chat-settings',
  standalone: true,
  imports: [CommonModule, InputComponent, UserPermsComponent, ToggleComponent],
  templateUrl: './chat-settings.component.html',
  styleUrls: ['./chat-settings.component.scss']
})
export class ChatSettingsComponent {

  generalChatGroup = new FormGroup<ChatSettingsFormGroup>({
    command: new FormControl('', { nonNullable: true }),
    cooldown: new FormControl(0, { nonNullable: true }),
    enabled: new FormControl(false, { nonNullable: true }),
    permissions: new FormGroup<ChatPermissionsFormGroup>({
      allUsers: new FormControl(false, { nonNullable: true }),
      mods: new FormControl(false, { nonNullable: true }),
      payingMembers: new FormControl(false, { nonNullable: true }),
    }),
  });

  gptChatGroup = new FormGroup<ChatSettingsFormGroup>({
    command: new FormControl('', { nonNullable: true }),
    cooldown: new FormControl(0, { nonNullable: true }),
    enabled: new FormControl(false, { nonNullable: true }),
    permissions: new FormGroup<ChatPermissionsFormGroup>({
      allUsers: new FormControl(false, { nonNullable: true }),
      mods: new FormControl(false, { nonNullable: true }),
      payingMembers: new FormControl(false, { nonNullable: true }),
    }),
  });

  constructor(private readonly configService: ConfigService) {
    this.configService.gptChat$
      .pipe(takeUntilDestroyed())
      .subscribe(gptChat => {
        this.gptChatGroup.setValue(gptChat, { emitEvent: false });
      });

    this.configService.generalChat$
      .pipe(takeUntilDestroyed())
      .subscribe(generalChat => {
        this.generalChatGroup.setValue(generalChat, { emitEvent: false });
      });

    this.gptChatGroup.controls.command.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(command => {
        this.configService.updateGptChat({ command });
      });

    this.gptChatGroup.controls.cooldown.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(cooldown => {
        this.configService.updateGptChat({ cooldown });
      });

    this.gptChatGroup.controls.enabled.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(enabled => {
        this.configService.updateGptChat({ enabled });
      });

    this.generalChatGroup.controls.command.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(command => {
        this.configService.updateGeneralChat({ command });
      });

    this.generalChatGroup.controls.cooldown.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(cooldown => {
        this.configService.updateGeneralChat({ cooldown });
      });

    this.generalChatGroup.controls.enabled.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(enabled => {
        this.configService.updateGeneralChat({ enabled });
      });

    this.gptChatGroup.controls.permissions.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(perms => {
        this.configService.updateChatPermissions(perms, 'gpt');
      });

    this.generalChatGroup.controls.permissions.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(perms => {
        this.configService.updateChatPermissions(perms, 'general');
      });
  }
}

export default ChatSettingsComponent;