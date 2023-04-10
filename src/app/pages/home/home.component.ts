import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { invoke } from '@tauri-apps/api/tauri';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AuditItem,
  AuditState,
} from 'src/app/shared/state/history/history-item.interface';
import { HistoryService } from 'src/app/shared/services/history.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  ttsControl = new FormControl<string>('');
  toggleControl = new FormControl<boolean>(true);
  history: AuditItem[] = [];

  constructor(
    private readonly historyService: HistoryService,
    private readonly snackbar: MatSnackBar
  ) {}

  speak(): void {
    const { value } = this.ttsControl;
    this.ttsControl.setValue('');

    invoke('play_tts', {
      request: {
        url: 'https://api.streamelements.com/kappa/v2/speech',
        params: [
          ['voice', 'Brian'],
          ['text', value],
        ],
      },
    })
      .then((id) => {
        if (typeof id != 'number') {
          throw new Error(`Unexpected response type: ${typeof id}`);
        }

        console.log('item id', id);

        this.historyService.addHistory({
          id,
          createdAt: new Date(),
          source: 'tts-helper',
          text: value ?? '[No TTS text found]',
          username: '[TTS-HELPER]',
          state: AuditState.playing,
        });
      })
      .catch((e) => {
        console.error(`Error invoking play_tts: ${e}`);

        this.snackbar.open(
          'Oops! We encountered an error while playing that.',
          'Dismiss',
          {
            panelClass: 'notification-error',
          }
        );
      });
  }

  get isDisabled() {
    return this.ttsControl.value === '';
  }
}
