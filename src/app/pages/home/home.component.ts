import { Component } from '@angular/core';
import { AuditItem } from 'src/app/shared/state/history/history-item.interface';
import { HistoryService } from 'src/app/shared/services/history.service';
import { nonNullFormControl } from 'src/app/shared/utils/form';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  ttsControl = nonNullFormControl('');
  history: AuditItem[] = [];

  constructor(private readonly historyService: HistoryService) {}

  speak(): void {
    const { value } = this.ttsControl;
    this.ttsControl.setValue('');

    this.historyService.playTts(value ?? 'Oops no rizz!', '', 'tts-helper');
  }

  get isDisabled() {
    return this.ttsControl.value === '';
  }
}
