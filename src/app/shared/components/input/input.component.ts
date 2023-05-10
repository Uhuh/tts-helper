import { Component, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
})
export class InputComponent {
  @Input() placeholder = 'Put something here...';
  @Input() control!: FormControl<string | number>;
  @Input() type = 'text';
}
