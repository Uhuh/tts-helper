import { Component } from '@angular/core';
import { invoke } from '@tauri-apps/api/tauri';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  greetingMessage = '';

  greet(event: SubmitEvent, name: string): void {
    event.preventDefault();

    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    invoke<string>('greet', { name }).then((text) => {
      this.greetingMessage = text;
    });

    invoke<string>('play_tts', {
      url: 'https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=pog%20online%20poggers',
    }).catch(console.error);
  }
}
