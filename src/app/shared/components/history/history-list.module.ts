import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryListComponent } from './history-list.component';
import { HistoryItemModule } from './history-item/history-item.module';
import { HistoryService } from '../../services/history.service';

@NgModule({
  declarations: [HistoryListComponent],
  imports: [CommonModule, HistoryItemModule],
  exports: [HistoryListComponent],
  providers: [HistoryService],
})
export class HistoryListModule {}
