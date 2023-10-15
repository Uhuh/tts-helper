import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

type Option = {
  displayName: string;
  value: string | number;
}

@Component({
  selector: 'app-selector',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatOptionModule, MatSelectModule, ReactiveFormsModule],
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.scss']
})
export class SelectorComponent {
  @Input({ required: true }) options!: Option[];
  @Input({ required: true }) control!: FormControl;
  @Input({ required: true }) placeholder!: string;
}
