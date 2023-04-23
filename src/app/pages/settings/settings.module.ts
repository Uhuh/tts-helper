import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { RouterModule } from '@angular/router';
import { InputModule } from 'src/app/shared/components/input/input.module';
import { ButtonModule } from 'src/app/shared/components/button/button.module';
import { StreamelementTtsComponent } from './streamelement-tts/streamelement-tts.component';
import { TtsMonsterComponent } from './tts-monster/tts-monster.component';
import { HistoryService } from 'src/app/shared/services/history.service';
import { ConfigService } from 'src/app/shared/services/config.service';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    SettingsComponent,
    StreamelementTtsComponent,
    TtsMonsterComponent,
  ],
  imports: [
    CommonModule,
    InputModule,
    ButtonModule,
    RouterModule.forChild([
      {
        path: '',
        component: SettingsComponent,
      },
    ]),
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
  exports: [SettingsComponent],
  providers: [HistoryService, ConfigService],
})
export class SettingsModule {}
