import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreamelementTtsComponent } from './streamelement-tts.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [StreamelementTtsComponent],
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: StreamelementTtsComponent,
      },
    ]),
  ],
  exports: [StreamelementTtsComponent],
})
export class StreamelementTtsModule {}
