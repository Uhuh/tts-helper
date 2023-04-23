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
import { ModerationComponent } from './moderation/moderation.component';
import { TtsMonsterComponent } from './tts-monster/tts-monster.component';
import { StreamelementTtsComponent } from './streamelement-tts/streamelement-tts.component';

@NgModule({
  declarations: [
    HomeComponent,
    ModerationComponent,
    TtsMonsterComponent,
    StreamelementTtsComponent,
  ],
  imports: [
    CommonModule,
    InputModule,
    MatFormFieldModule,
    FormsModule,
    ButtonModule,
    ToggleModule,
    RouterModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomeComponent,
      },
    ]),
    ReactiveFormsModule,
    MatSelectModule,
  ],
  exports: [HomeComponent],
})
export class HomeModule {}
