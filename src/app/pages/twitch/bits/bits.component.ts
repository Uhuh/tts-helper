import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import { debounceTime, filter } from 'rxjs';
import { TwitchService } from 'src/app/shared/services/twitch.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputComponent } from '../../../shared/components/input/input.component';
import { NgIf } from '@angular/common';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';

@Component({
  selector: 'app-bits',
  templateUrl: './bits.component.html',
  styleUrls: ['./bits.component.scss'],
  standalone: true,
  imports: [ToggleComponent, NgIf, InputComponent, MatFormFieldModule, LabelBlockComponent],
})
export class BitsComponent {
  private readonly twitchService = inject(TwitchService);
  readonly minBits = new FormControl(0, {
    nonNullable: true,
    validators: [Validators.min(0), Validators.pattern('^-?[0-9]+$')],
  });
  readonly bitsCharLimit = new FormControl(300, {
    nonNullable: true,
    validators: [Validators.min(0), Validators.pattern('^-?[0-9]+$')],
  });
  readonly enabled = new FormControl(true, { nonNullable: true });
  readonly exact = new FormControl(false, { nonNullable: true });

  constructor() {
    this.twitchService.bitInfo$
      .pipe(takeUntilDestroyed())
      .subscribe((bitInfo) => {
        this.minBits.patchValue(bitInfo.minBits, { emitEvent: false });
        this.bitsCharLimit.patchValue(bitInfo.bitsCharacterLimit, {
          emitEvent: false,
        });
        this.enabled.patchValue(bitInfo.enabled, { emitEvent: false });
        this.exact.patchValue(bitInfo.exact, { emitEvent: false });
      });

    this.minBits.valueChanges
      .pipe(
        takeUntilDestroyed(),
        debounceTime(1000),
        filter(() => this.minBits.valid),
      )
      .subscribe((minBits) => {
        this.twitchService.updateMinBits(Number(minBits));
      });

    this.bitsCharLimit.valueChanges
      .pipe(
        takeUntilDestroyed(),
        debounceTime(1000),
        filter(() => this.bitsCharLimit.valid),
      )
      .subscribe((bitsCharLimit) => {
        this.twitchService.updateBitsCharLimit(Number(bitsCharLimit));
      });

    this.enabled.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((enabled) => this.twitchService.updateBitsEnabled(enabled));

    this.exact.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((exact) => this.twitchService.updateBitsExact(exact));
  }
}
