import { Component, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Subject, debounceTime, filter, takeUntil } from 'rxjs';
import { TwitchService } from 'src/app/shared/services/twitch.service';
import { nonNullFormControl } from 'src/app/shared/utils/form';

@Component({
  selector: 'app-bits',
  templateUrl: './bits.component.html',
  styleUrls: ['./bits.component.scss'],
})
export class BitsComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  minBits = nonNullFormControl(0, {
    validators: [Validators.min(0), Validators.pattern('^-?[0-9]+$')],
  });
  bitsCharLimit = nonNullFormControl(300, {
    validators: [Validators.min(0), Validators.pattern('^-?[0-9]+$')],
  });
  enabled = nonNullFormControl(true);

  constructor(private readonly twitchService: TwitchService) {}

  ngOnInit(): void {
    this.twitchService.bitInfo$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((bitInfo) => {
        this.minBits.patchValue(bitInfo.minBits, { emitEvent: false });
        this.bitsCharLimit.patchValue(bitInfo.bitsCharacterLimit, {
          emitEvent: false,
        });
        this.enabled.patchValue(bitInfo.enabled, { emitEvent: false });
      });

    this.minBits.valueChanges
      .pipe(
        takeUntil(this.destroyed$),
        debounceTime(1000),
        filter(() => this.minBits.valid && !this.minBits.pristine)
      )
      .subscribe((minBits) => {
        this.twitchService.updateMinBits(Number(minBits));
      });

    this.bitsCharLimit.valueChanges
      .pipe(
        takeUntil(this.destroyed$),
        debounceTime(1000),
        filter(() => this.bitsCharLimit.valid && !this.bitsCharLimit.pristine)
      )
      .subscribe((bitsCharLimit) => {
        this.twitchService.updateBitsCharLimit(Number(bitsCharLimit));
      });

    this.enabled.valueChanges
      .pipe(
        takeUntil(this.destroyed$),
        debounceTime(1000),
        filter(() => !this.enabled.pristine)
      )
      .subscribe((enabled) => {
        this.twitchService.updateBitEnabled(enabled);
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
