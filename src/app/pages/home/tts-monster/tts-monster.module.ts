import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TtsMonsterComponent } from './tts-monster.component';
import { InputModule } from 'src/app/shared/components/input/input.module';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [TtsMonsterComponent],
  imports: [
    CommonModule,
    InputModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: TtsMonsterComponent,
      },
    ]),
  ],
  exports: [TtsMonsterComponent],
})
export class TtsMonsterModule {}
