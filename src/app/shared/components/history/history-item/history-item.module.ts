import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryItemComponent } from './history-item.component';

@NgModule({
  declarations: [HistoryItemComponent],
  imports: [CommonModule],
  exports: [HistoryItemComponent],
})
export class HistoryItemModule {}
