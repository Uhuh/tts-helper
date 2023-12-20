import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VStreamService } from '../../../shared/services/vstream.service';
import { ChatCommand } from '../../../shared/services/chat.interface';
import { EditCommandComponent } from './edit-command/edit-command.component';

@Component({
  selector: 'app-chat-commands',
  standalone: true,
  imports: [CommonModule, EditCommandComponent],
  templateUrl: './chat-commands.component.html',
  styleUrl: './chat-commands.component.scss',
})
export class ChatCommandsComponent {
  commands: ChatCommand[] = [
    {
      command: '!social',
      cooldown: 5,
      enabled: true,
      permissions: {
        allUsers: true,
        mods: false,
        payingMembers: false,
      },
    },
    {
      command: '!discord',
      cooldown: 0,
      enabled: true,
      permissions: {
        allUsers: true,
        mods: false,
        payingMembers: false,
      },
    },
  ];

  constructor(private readonly vstreamService: VStreamService) {}
}
