import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AuditItem } from 'src/app/shared/state/history/history-item.interface';
import { HistoryService } from 'src/app/shared/services/history.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  ttsControl = new FormControl<string>('');
  disableHistory = new FormControl<boolean>(false);
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
