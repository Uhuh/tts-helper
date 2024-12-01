import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VStreamService } from '../../../shared/services/vstream.service';
import { EditCommandComponent } from './edit-command/edit-command.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';

@Component({
    selector: 'app-commands',
    imports: [CommonModule, EditCommandComponent, MatTabsModule, ButtonComponent, LabelBlockComponent],
    templateUrl: './commands.component.html',
    styleUrl: './commands.component.scss'
})
export class CommandsComponent {
  private readonly vstreamService = inject(VStreamService);

  readonly commands$ = this.vstreamService.commands$;

  createCommand() {
    this.vstreamService.createChatCommand();
  }
}
