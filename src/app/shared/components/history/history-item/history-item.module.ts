import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryItemComponent } from './history-item.component';
import { ButtonModule } from '../../button/button.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [HistoryItemComponent],
  imports: [CommonModule, ButtonModule, MatSnackBarModule],
  exports: [HistoryItemComponent],
})
export class HistoryItemModule {}
