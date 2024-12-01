import { Component, inject } from '@angular/core';
import { InputComponent } from '../../../shared/components/input/input.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import { TwitchService } from '../../../shared/services/twitch.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import {
  VariableTableComponent,
  VariableTableOption,
} from '../../../shared/components/variable-table/variable-table.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-followers',
    imports: [
        InputComponent,
        LabelBlockComponent,
        MatFormFieldModule,
        ToggleComponent,
        NgClass,
        FormsModule,
        VariableTableComponent,
        ReactiveFormsModule,
    ],
    templateUrl: './followers.component.html',
    styleUrl: './followers.component.scss'
})
export class FollowersComponent {
  private readonly twitchService = inject(TwitchService);

  readonly settings = new FormGroup({
    enabled: new FormControl(false, { nonNullable: true }),
    customMessage: new FormControl('', { nonNullable: true }),
  });

  readonly variables: VariableTableOption[] = [
    { variable: 'username', descriptor: 'The username of the follower.' },
  ];

  constructor() {
    this.twitchService.follower$
      .pipe(takeUntilDestroyed())
      .subscribe(follower => this.settings.setValue(follower, { emitEvent: false }));

    this.settings.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(settings => this.twitchService.updateFollowerSettings(settings));
  }
}
