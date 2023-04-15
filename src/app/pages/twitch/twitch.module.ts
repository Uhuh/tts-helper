import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TwitchComponent } from './twitch.component';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'src/app/shared/components/button/button.module';
import { InputModule } from "../../shared/components/input/input.module";

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
    InputModule,
  ],
  exports: [TwitchComponent],
})
export class TwitchModule {}
