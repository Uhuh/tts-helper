import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-bits',
  templateUrl: './bits.component.html',
  styleUrls: ['./bits.component.scss'],
})
export class BitsComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  bitsControl = new FormControl('');
  bitsCharControl = new FormControl('');

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
