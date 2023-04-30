import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TwitchComponent } from './twitch.component';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'src/app/shared/components/button/button.module';
import { InputModule } from '../../shared/components/input/input.module';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthComponent } from './auth/auth.component';
import { BitsComponent } from './bits/bits.component';
import { RedeemsComponent } from './redeems/redeems.component';
import { ToggleModule } from 'src/app/shared/components/toggle/toggle.module';
import { SubsComponent } from './subs/subs.component';

@NgModule({
  declarations: [
    TwitchComponent,
    AuthComponent,
    BitsComponent,
    RedeemsComponent,
    SubsComponent,
  ],
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
    ToggleModule,
  ],
  exports: [TwitchComponent],
})
export class TwitchModule {}
