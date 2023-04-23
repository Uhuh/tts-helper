import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { nonNullFormControl } from 'src/app/shared/utils/form';

@Component({
  selector: 'app-tts-monster',
  templateUrl: './tts-monster.component.html',
  styleUrls: ['./tts-monster.component.scss'],
})
export class TtsMonsterComponent {
  private readonly ttsMonsterUSEast =
    'https://us-central1-tts-monster.cloudfunctions.net/generateTTS';

  controlGroup = new FormGroup({
    overlay: nonNullFormControl(''),
    ai: nonNullFormControl(false),
  });
}
