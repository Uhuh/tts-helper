import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GptPersonalityFormGroup } from '../chat-gpt.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-gpt-personality',
  standalone: true,
  imports: [CommonModule, InputComponent, ReactiveFormsModule],
  templateUrl: './gpt-personality.component.html',
  styleUrls: ['./gpt-personality.component.scss']
})
export class GptPersonalityComponent {
  @Input({ required: true }) formGroup!: FormGroup<GptPersonalityFormGroup>;
}
