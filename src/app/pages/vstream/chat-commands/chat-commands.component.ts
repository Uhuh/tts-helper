import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VStreamService } from '../../../shared/services/vstream.service';
import { EditCommandComponent } from './edit-command/edit-command.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';

@Component({
  selector: 'app-chat-commands',
  standalone: true,
  imports: [CommonModule, EditCommandComponent, MatTabsModule, ButtonComponent, LabelBlockComponent],
  templateUrl: './chat-commands.component.html',
  styleUrl: './chat-commands.component.scss',
})
export class ChatCommandsComponent {
  commands$ = this.vstreamService.commands$;

  constructor(private readonly vstreamService: VStreamService) {}
  
  createCommand() {
    this.vstreamService.createChatCommand();
  }
}
