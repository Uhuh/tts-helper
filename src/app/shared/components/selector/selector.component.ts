import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

export type Option<T> = {
  displayName: string;
  value: T;
};

@Component({
    selector: 'app-selector',
    imports: [CommonModule, MatFormFieldModule, MatOptionModule, MatSelectModule, ReactiveFormsModule],
    templateUrl: './selector.component.html',
    styleUrls: ['./selector.component.scss']
})
export class SelectorComponent<T> {
  @Input({ required: true }) options!: Option<T>[];
  @Input({ required: true }) control!: FormControl;
  @Input({ required: true }) placeholder!: string;
}
