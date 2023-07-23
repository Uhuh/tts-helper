import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../shared/components/input/input.component';
import { UserPermsComponent } from './user-perms/user-perms.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  charLimit: FormControl<number>;
}

@Component({
  selector: 'app-chat-settings',
  standalone: true,
  imports: [CommonModule, InputComponent, UserPermsComponent, ToggleComponent],
  templateUrl: './chat-settings.component.html',
  styleUrls: ['./chat-settings.component.scss']
})
export class ChatSettingsComponent {

  generalChat = new FormGroup<ChatSettingsFormGroup>({
    command: new FormControl('', { nonNullable: true }),
    cooldown: new FormControl(0, { nonNullable: true }),
    enabled: new FormControl(false, { nonNullable: true }),
    charLimit: new FormControl(100, { nonNullable: true, validators: [Validators.min(0)] }),
  });
  
  generalPermissions = new FormGroup<ChatPermissionsFormGroup>({
    allUsers: new FormControl(false, { nonNullable: true }),
    mods: new FormControl(false, { nonNullable: true }),
    payingMembers: new FormControl(false, { nonNullable: true }),
  });

  gptChat = new FormGroup<ChatSettingsFormGroup>({
    command: new FormControl('', { nonNullable: true }),
    cooldown: new FormControl(0, { nonNullable: true }),
    enabled: new FormControl(false, { nonNullable: true }),
    charLimit: new FormControl(100, { nonNullable: true, validators: [Validators.min(0)] }),
  });
  
  gptPermissions = new FormGroup<ChatPermissionsFormGroup>({
    allUsers: new FormControl(false, { nonNullable: true }),
    mods: new FormControl(false, { nonNullable: true }),
    payingMembers: new FormControl(false, { nonNullable: true }),
  });

  constructor(private readonly configService: ConfigService) {
    this.configService.gptChat$
      .pipe(takeUntilDestroyed())
      .subscribe(gptChat => {
        const { permissions, ...settings } = gptChat;
        this.gptChat.setValue(settings, { emitEvent: false });
        this.gptPermissions.setValue(permissions, { emitEvent: false });
      });

    this.configService.generalChat$
      .pipe(takeUntilDestroyed())
      .subscribe(generalChat => {
        const { permissions, ...settings } = generalChat;
        this.generalChat.setValue(settings, { emitEvent: false });
        this.generalPermissions.setValue(permissions, { emitEvent: false });
      });

    this.gptChat.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(gptChat => {
        this.configService.updateGptChat(gptChat);
      });

    this.generalChat.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(generalChat => {
        this.configService.updateGeneralChat(generalChat);
      });

    this.gptPermissions.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(perms => {
        this.configService.updateChatPermissions(perms, 'gpt');
      });

    this.generalPermissions.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(perms => {
        this.configService.updateChatPermissions(perms, 'general');
      });
  }
}

export default ChatSettingsComponent;