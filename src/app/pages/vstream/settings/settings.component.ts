import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../../shared/components/input/input.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { FormControl, Validators } from '@angular/forms';
import { VStreamService } from '../../../shared/services/vstream.service';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, InputComponent, LabelBlockComponent, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly vstreamService = inject(VStreamService);
  readonly randomChance = new FormControl(0, {
    nonNullable: true,
    validators: [Validators.min(0), Validators.max(100)],
  });

  constructor() {
    this.vstreamService.settings$
      .pipe(takeUntilDestroyed())
      .subscribe(settings => {
        this.randomChance.setValue(settings.randomChance, { emitEvent: false });
      });

    this.randomChance.valueChanges
      .pipe(filter(() => this.randomChance.valid))
      .subscribe(randomChance => this.vstreamService.updateSettings({ randomChance }));
  }
}
