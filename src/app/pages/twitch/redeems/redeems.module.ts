import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RedeemsComponent } from './redeems.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TwitchService } from 'src/app/shared/services/twitch.service';
import { ReactiveFormsModule } from '@angular/forms';
import { InputModule } from 'src/app/shared/components/input/input.module';

@NgModule({
  declarations: [RedeemsComponent],
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    InputModule,
  ],
  exports: [RedeemsComponent],
  providers: [TwitchService],
})
export class RedeemsModule {}
