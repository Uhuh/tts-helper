import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryComponent } from './history.component';
import { HistoryItemModule } from './history-item/history-item.module';

@NgModule({
  declarations: [HistoryComponent],
  imports: [CommonModule, HistoryItemModule],
  exports: [HistoryComponent],
})
export class HistoryModule {}
