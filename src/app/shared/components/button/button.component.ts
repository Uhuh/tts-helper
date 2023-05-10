import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

export type ButtonStyles = 'primary' | 'active' | 'outline';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  standalone: true,
  imports: [NgClass],
})
export class ButtonComponent {
  @Input() text = '[NONE]';
  @Input() disabled = false;
  @Input() size = 'md';
  @Input() style: ButtonStyles = 'primary';
}
