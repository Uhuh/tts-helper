import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { InputModule } from '../../shared/components/input/input.module';
import { ButtonModule } from '../../shared/components/button/button.module';
import { ToggleModule } from '../../shared/components/toggle/toggle.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { TtsRouterComponent } from './tts-router/tts-router.component';
import { ModerationComponent } from './moderation/moderation.component';

@NgModule({
  declarations: [HomeComponent, TtsRouterComponent, ModerationComponent],
  imports: [
    CommonModule,
    InputModule,
    MatFormFieldModule,
    FormsModule,
    ButtonModule,
    ToggleModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomeComponent,
        children: [
          {
            path: 'stream-elements',
            loadChildren: () =>
              import('./streamelement-tts/streamelement-tts.module').then(
                (m) => m.StreamelementTtsModule
              ),
          },
          {
            path: 'tts-monster',
            loadChildren: () =>
              import('./tts-monster/tts-monster.module').then(
                (m) => m.TtsMonsterModule
              ),
          },
        ],
      },
    ]),
    RouterModule,
    ReactiveFormsModule,
    MatSelectModule,
  ],
  exports: [HomeComponent],
})
export class HomeModule {}
