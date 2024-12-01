import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChainCommand } from '../../../../../../shared/services/command.interface';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import { VStreamService } from '../../../../../../shared/services/vstream.service';
import { map, Observable } from 'rxjs';
import { Option, SelectorComponent } from '../../../../../../shared/components/selector/selector.component';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-edit-chain-command',
    imports: [CommonModule, ButtonComponent, SelectorComponent],
    templateUrl: './edit-chain-command.component.html',
    styleUrl: './edit-chain-command.component.scss'
})
export class EditChainCommandComponent implements OnInit {
  private readonly vstreamService = inject(VStreamService);

  readonly chainCommandControl = new FormControl<string | null>(null);
  readonly options$: Observable<Option<string>[]> = this.vstreamService.commands$
    .pipe(map(commands => commands.filter(c => c.id !== this.parentCommandID)
      .map(c => ({
          displayName: c.command,
          value: c.id,
        }),
      )),
    );

  @Input({ required: true }) parentCommandID!: string;
  @Input({ required: true }) chainCommand!: ChainCommand;

  ngOnInit() {
    this.chainCommandControl.setValue(this.chainCommand.chainCommandID);

    this.chainCommandControl.valueChanges
      .subscribe(id => {
        this.vstreamService.updateChainCommand(this.parentCommandID, this.chainCommand.id, id);
      });
  }

  deleteChainCommand() {
    this.vstreamService.deleteChainCommand(this.parentCommandID, this.chainCommand.id);
  }
}
