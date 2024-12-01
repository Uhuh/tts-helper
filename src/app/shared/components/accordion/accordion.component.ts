import { Component } from '@angular/core';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-accordion',
  imports: [
    CdkAccordionModule,
    MatIconModule,
  ],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
})
export class AccordionComponent {

}
