import { Component } from '@angular/core';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    LabelBlockComponent,
    RouterLink,
  ],
})
export class HomeComponent {}

export default HomeComponent;