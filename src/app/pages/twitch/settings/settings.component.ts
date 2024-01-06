import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { FormControl, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';
import { TwitchService } from '../../../shared/services/twitch.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, LabelBlockComponent, InputComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly twitchService = inject(TwitchService);
  readonly randomChance = new FormControl(0, {
    nonNullable: true,
    validators: [Validators.min(0), Validators.max(100)],
  });

  constructor() {
    this.twitchService.settings$
      .pipe(takeUntilDestroyed(), take(1))
      .subscribe(settings => this.randomChance.setValue(settings.randomChance, { emitEvent: false }));

    this.randomChance.valueChanges
      .pipe(takeUntilDestroyed(), filter(() => this.randomChance.valid))
      .subscribe(randomChance => this.twitchService.updateSettings({ randomChance }));
  }
}
