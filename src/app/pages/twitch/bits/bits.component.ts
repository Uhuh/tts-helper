import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TwitchService } from 'src/app/shared/services/twitch.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputComponent } from '../../../shared/components/input/input.component';
import { NgIf } from '@angular/common';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { debounceTime, filter } from 'rxjs';

@Component({
  selector: 'app-bits',
  templateUrl: './bits.component.html',
  styleUrls: ['./bits.component.scss'],
  standalone: true,
  imports: [ToggleComponent, NgIf, InputComponent, MatFormFieldModule, LabelBlockComponent],
})
export class BitsComponent {
  private readonly twitchService = inject(TwitchService);

  readonly settings = new FormGroup({
    enabled: new FormControl(false, { nonNullable: true }),
    exact: new FormControl(false, { nonNullable: true }),
    minBits: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.min(0), Validators.pattern('^-?[0-9]+$')],
    }),
    bitsCharacterLimit: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.min(0), Validators.pattern('^-?[0-9]+$')],
    }),
  });

  constructor() {
    this.twitchService.bitInfo$
      .pipe(takeUntilDestroyed())
      .subscribe((settings) => {
        this.settings.setValue(settings, { emitEvent: false });
      });

    this.settings.valueChanges
      .pipe(takeUntilDestroyed(), debounceTime(200), filter(() => this.settings.valid))
      .subscribe(settings => {
        this.twitchService.updateBitsSetting({
          ...settings,
          minBits: Number(settings.minBits),
          bitsCharacterLimit: Number(settings.bitsCharacterLimit),
        });
      });
  }
}
