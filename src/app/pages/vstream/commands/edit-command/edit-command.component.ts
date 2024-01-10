import { ChangeDetectionStrategy, Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { LabelBlockComponent } from '../../../../shared/components/input-block/label-block.component';
import { ToggleComponent } from '../../../../shared/components/toggle/toggle.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { VStreamService } from '../../../../shared/services/vstream.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { MatTabsModule } from '@angular/material/tabs';
import { TextCommandComponent } from './text-command/text-command.component';
import { Commands, CommandTypes } from '../../../../shared/services/command.interface';
import { Option, SelectorComponent } from '../../../../shared/components/selector/selector.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChoiceCommandComponent } from './choice-command/choice-command.component';
import { CounterCommandComponent } from './counter-command/counter-command.component';
import { SoundCommandComponent } from './sound-component/sound-command.component';

@Component({
  selector: 'app-edit-command',
  standalone: true,
  imports: [CommonModule, CdkAccordionModule, LabelBlockComponent, ToggleComponent, MatIconModule, ReactiveFormsModule, InputComponent, ButtonComponent, MatTabsModule, TextCommandComponent, SelectorComponent, ChoiceCommandComponent, CounterCommandComponent, SoundCommandComponent],
  templateUrl: './edit-command.component.html',
  styleUrl: './edit-command.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCommandComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly vstreamService = inject(VStreamService);
  readonly options: Option<CommandTypes>[] = [
    { displayName: 'Chat', value: 'chat' },
    { displayName: 'Choice', value: 'choice' },
    { displayName: 'Counter', value: 'counter' },
    { displayName: 'Sound', value: 'sound' },
  ];

  readonly type = new FormControl<CommandTypes>('chat', { nonNullable: true });

  @Input({ required: true }) command!: Commands;

  ngOnInit() {
    this.type.setValue(this.command.type, { emitEvent: false });

    this.type.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(type => {
        this.vstreamService.updateCommandType(type, this.command.id);
      });
  }

  deleteCommand() {
    this.vstreamService.deleteCommand(this.command.id);
  }
}
