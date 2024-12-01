import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VStreamService } from '../../../../../shared/services/vstream.service';
import { Commands } from '../../../../../shared/services/command.interface';
import { Option } from '../../../../../shared/components/selector/selector.component';
import { map, Observable } from 'rxjs';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { LabelBlockComponent } from '../../../../../shared/components/input-block/label-block.component';
import { EditChainCommandComponent } from './edit-chain-command/edit-chain-command.component';

@Component({
    selector: 'app-chain-command',
    imports: [CommonModule, ButtonComponent, LabelBlockComponent, EditChainCommandComponent],
    templateUrl: './chain-command.component.html',
    styleUrl: './chain-command.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChainCommandComponent {
  private readonly vstreamService = inject(VStreamService);

  readonly options$: Observable<Option<string>[]> = this.vstreamService.commands$
    .pipe(map(commands => commands.filter(c => c.id !== this.command.id).map(c => ({
      displayName: c.command,
      value: c.id,
    }))));

  @Input({ required: true }) command!: Commands;

  createChainCommand() {
    this.vstreamService.createChainCommand(this.command.id, null);
  }
}
