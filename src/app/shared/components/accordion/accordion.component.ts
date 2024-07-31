import { Component } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { MatIconModule } from '@angular/material/icon';
import { SelectorComponent } from '../selector/selector.component';
import { TtsSelectorComponent } from '../tts-selector/tts-selector.component';

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [
    ButtonComponent,
    CdkAccordionModule,
    MatIconModule,
    SelectorComponent,
    TtsSelectorComponent,
  ],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
})
export class AccordionComponent {

}
