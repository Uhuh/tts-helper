import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TwitchComponent } from './twitch.component';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'src/app/shared/components/button/button.module';
import { InputModule } from '../../shared/components/input/input.module';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [TwitchComponent],
  imports: [
    CommonModule,
    ButtonModule,
    RouterModule.forChild([
      {
        path: '',
        component: TwitchComponent,
      },
    ]),
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    InputModule,
  ],
  exports: [TwitchComponent],
})
export class TwitchModule {}
