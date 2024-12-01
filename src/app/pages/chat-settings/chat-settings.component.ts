import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../shared/components/input/input.component';
import { UserPermsComponent } from './user-perms/user-perms.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfigService } from '../../shared/services/config.service';
import { ToggleComponent } from '../../shared/components/toggle/toggle.component';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';
import { OpenAIService } from '../../shared/services/openai.service';

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
    imports: [CommonModule, InputComponent, UserPermsComponent, ToggleComponent, LabelBlockComponent],
    templateUrl: './chat-settings.component.html',
    styleUrls: ['./chat-settings.component.scss']
})
export class ChatSettingsComponent {
  private readonly configService = inject(ConfigService);
  private readonly openAIService = inject(OpenAIService);

  readonly generalChat = new FormGroup<ChatSettingsFormGroup>({
    command: new FormControl('', { nonNullable: true }),
    cooldown: new FormControl(0, { nonNullable: true }),
    enabled: new FormControl(false, { nonNullable: true }),
    charLimit: new FormControl(100, { nonNullable: true, validators: [Validators.min(0)] }),
  });

  readonly generalPermissions = new FormGroup<ChatPermissionsFormGroup>({
    allUsers: new FormControl(false, { nonNullable: true }),
    mods: new FormControl(false, { nonNullable: true }),
    payingMembers: new FormControl(false, { nonNullable: true }),
  });

  readonly gptChat = new FormGroup<ChatSettingsFormGroup>({
    command: new FormControl('', { nonNullable: true }),
    cooldown: new FormControl(0, { nonNullable: true }),
    enabled: new FormControl(false, { nonNullable: true }),
    charLimit: new FormControl(999, { nonNullable: true, validators: [Validators.min(0)] }),
  });

  readonly gptPermissions = new FormGroup<ChatPermissionsFormGroup>({
    allUsers: new FormControl(false, { nonNullable: true }),
    mods: new FormControl(false, { nonNullable: true }),
    payingMembers: new FormControl(false, { nonNullable: true }),
  });

  constructor() {
    this.openAIService.chatSettings$
      .pipe(takeUntilDestroyed())
      .subscribe(chatSettings => {
        const { permissions, ...settings } = chatSettings;
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
        this.openAIService.updateChatSettings(gptChat);
      });

    this.generalChat.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(generalChat => {
        this.configService.updateGeneralChat(generalChat);
      });

    this.gptPermissions.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(perms => {
        this.openAIService.updateChatPermissions(perms);
      });

    this.generalPermissions.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(perms => {
        this.configService.updateChatPermissions(perms);
      });
  }
}

export default ChatSettingsComponent;