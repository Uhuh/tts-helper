import { Component } from '@angular/core';
import { invoke } from '@tauri-apps/api/tauri';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  greet(event: SubmitEvent, text: string): void {
    event.preventDefault();

    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    invoke('play_tts', {
      request: {
        url: 'https://api.streamelements.com/kappa/v2/speech',
        params: [['voice', 'Brian'], ['text', text]]
      }
    }).catch(console.error);
  }
}
