import { Component } from '@angular/core';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    LabelBlockComponent,
    MatIconModule,
  ],
})
export class HomeComponent {
}

export default HomeComponent;