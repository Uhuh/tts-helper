import { Component, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { nonNullFormControl } from 'src/app/shared/utils/form';

@Component({
  selector: 'app-bits',
  templateUrl: './bits.component.html',
  styleUrls: ['./bits.component.scss'],
})
export class BitsComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  bits = nonNullFormControl(0, {
    validators: [Validators.min(0), Validators.pattern('^-?[0-9]+$')],
  });
  bitsCharLimit = nonNullFormControl(300, { validators: [Validators.min(0)] });

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
