import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { InputModule } from '../../shared/components/input/input.module';
import { ButtonModule } from '../../shared/components/button/button.module';
import { ToggleModule } from '../../shared/components/toggle/toggle.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { HistoryService } from 'src/app/shared/services/history.service';
import { MatSelectModule } from '@angular/material/select';
import { TtsRouterModule } from './tts-router/tts-router.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    InputModule,
    MatFormFieldModule,
    FormsModule,
    ButtonModule,
    ToggleModule,
    TtsRouterModule,
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
        ],
      },
    ]),
    RouterModule,
    MatSelectModule,
  ],
  exports: [HomeComponent],
  providers: [HistoryService],
})
export class HomeModule {}
