import { Component, effect, inject } from '@angular/core';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import {
  VariableTableComponent,
  VariableTableOption,
} from '../../../shared/components/variable-table/variable-table.component';
import { YoutubeService } from '../../../shared/services/youtube.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';

@Component({
  selector: 'app-superchat',
  imports: [
    LabelBlockComponent,
    ReactiveFormsModule,
    ToggleComponent,
    VariableTableComponent,
  ],
  templateUrl: './superchat.component.html',
  styleUrl: './superchat.component.scss',
})
export class SuperchatComponent {
  readonly #youtubeService = inject(YoutubeService);

  readonly settings = new FormGroup({
    enabled: new FormControl(false, { nonNullable: true }),
    customMessage: new FormControl('', { nonNullable: true }),
  });

  readonly variables: VariableTableOption[] = [
    { variable: 'username', descriptor: 'The username of the super chatter.' },
    { variable: 'amount', descriptor: 'The amount of the super chat.' },
  ];

  constructor() {
    effect(() => {
      this.settings.setValue({
        enabled: this.#youtubeService.youtubeStore.superChat().enabled,
        customMessage: this.#youtubeService.youtubeStore.superChat().customMessage,
      }, { emitEvent: false });
    });

    this.settings.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((settings) => this.#youtubeService.updateSuperChat(settings));
  }
}
