import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TtsRouterComponent } from './tts-router.component';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'src/app/shared/components/button/button.module';

@NgModule({
  declarations: [TtsRouterComponent],
  imports: [CommonModule, RouterModule, ButtonModule],
  exports: [TtsRouterComponent],
})
export class TtsRouterModule {}
