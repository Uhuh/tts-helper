import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModerationComponent } from './moderation.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ToggleModule } from 'src/app/shared/components/toggle/toggle.module';

@NgModule({
  declarations: [ModerationComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToggleModule,
    RouterModule.forChild([
      {
        path: '',
        component: ModerationComponent,
      },
    ]),
  ],
  exports: [ModerationComponent],
})
export class ModerationModule {}
