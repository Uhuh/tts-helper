import { Component } from '@angular/core';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    LabelBlockComponent
  ]
})
export class HomeComponent {}

export default HomeComponent;