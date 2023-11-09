import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';
import { InputComponent } from '../../shared/components/input/input.component';

@Component({
  selector: 'app-azure-stt',
  standalone: true,
  imports: [CommonModule, LabelBlockComponent, InputComponent],
  templateUrl: './azure-stt.component.html',
  styleUrls: ['./azure-stt.component.scss']
})
export class AzureSttComponent {
  azureSettings = new FormGroup({
    apiKey: new FormControl('', { nonNullable: true })
  });
  
}

export default AzureSttComponent;