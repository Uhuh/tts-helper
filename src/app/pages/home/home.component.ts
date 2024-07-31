import { Component } from '@angular/core';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    LabelBlockComponent,
    RouterLink,
    MatIconModule,
  ],
})
export class HomeComponent {}

export default HomeComponent;