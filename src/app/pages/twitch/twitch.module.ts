import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TwitchComponent } from './twitch.component';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'src/app/shared/components/button/button.module';

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
  ],
  exports: [TwitchComponent],
})
export class TwitchModule {}
