import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth/auth.component';

@Component({
  selector: 'app-vstream',
  standalone: true,
  imports: [CommonModule, AuthComponent],
  templateUrl: './vstream.component.html',
  styleUrl: './vstream.component.scss',
})
export class VstreamComponent {
}

export default VstreamComponent;