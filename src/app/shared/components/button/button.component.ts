import { Component, Input } from '@angular/core';

export type ButtonStyles = 'primary' | 'active' | 'outline' | 'danger';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  imports: [],
})
export class ButtonComponent {
  @Input() disabled = false;
  @Input() size = 'md';
  @Input() style: ButtonStyles = 'primary';
}
