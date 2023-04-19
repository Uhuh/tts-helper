import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-bits',
  templateUrl: './bits.component.html',
  styleUrls: ['./bits.component.scss'],
})
export class BitsComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  @Input() bitsGroup!: FormGroup;

  ngOnInit(): void {}

  get bitsControl() {
    return this.bitsGroup.get('bits') as FormControl<number>;
  }

  get bitsCharLimitControl() {
    return this.bitsGroup.get('bitsCharLimit') as FormControl<number>;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
