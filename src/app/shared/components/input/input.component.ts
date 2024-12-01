import { Component, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-input',
    templateUrl: './input.component.html',
    styleUrls: ['./input.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, NgClass]
})
export class InputComponent<TKey extends string | number> {
  @Input() placeholder = 'Put something here...';
  @Input({ required: true }) control!: FormControl<TKey>;
  @Input({ required: true }) type!: TKey extends string ? 'text' | 'password' : TKey extends number ? 'number' : never;
  @Input() hasError = false;
}
