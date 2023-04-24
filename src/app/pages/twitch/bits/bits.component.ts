import { Component, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Subject, combineLatest, debounceTime, filter, takeUntil } from 'rxjs';
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

  constructor(private readonly twitchService: TwitchService) {}

  ngOnInit(): void {
    combineLatest([
      this.twitchService.minBits$,
      this.twitchService.bitsCharLimit$,
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([minBits, bitsCharLimit]) => {
        this.minBits.patchValue(minBits, { emitEvent: false });
        this.bitsCharLimit.patchValue(bitsCharLimit, { emitEvent: false });
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
        this.twitchService.updateBitsCharLimit(bitsCharLimit);
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
