import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryComponent } from './history.component';
import { HistoryListModule } from 'src/app/shared/components/history/history-list.module';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'src/app/shared/components/button/button.module';

@NgModule({
  declarations: [HistoryComponent],
  imports: [
    CommonModule,
    ButtonModule,
    HistoryListModule,
    RouterModule.forChild([
      {
        path: '',
        component: HistoryComponent,
      },
    ]),
  ],
  exports: [HistoryComponent],
})
export class HistoryModule {}
