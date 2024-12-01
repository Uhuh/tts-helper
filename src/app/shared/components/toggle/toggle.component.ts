import { Component, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';

@Component({
    selector: 'app-toggle',
    templateUrl: './toggle.component.html',
    styleUrls: ['./toggle.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, NgClass, NgIf]
})
export class ToggleComponent {
  @Input({ required: true }) control!: FormControl<boolean>;
  @Input() text?: string;
}
