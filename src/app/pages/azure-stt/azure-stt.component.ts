import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { SelectorComponent } from '../../shared/components/selector/selector.component';
import azureTts from '../../shared/json/azure-stt.json';
import RecordRTC from 'recordrtc';

@Component({
  selector: 'app-azure-stt',
  standalone: true,
  imports: [CommonModule, LabelBlockComponent, InputComponent, SelectorComponent],
  templateUrl: './azure-stt.component.html',
  styleUrls: ['./azure-stt.component.scss'],
})
export class AzureSttComponent {
  regions = azureTts.regions;
  languages = azureTts.languages;
  stream?: MediaStream;

  azureSettings = new FormGroup({
    apiKey: new FormControl('', { nonNullable: true }),
    region: new FormControl('', { nonNullable: true }),
    language: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    // Prompt user for mic access
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => this.handleStream(stream));
  }

  async handleStream(stream: MediaStream) {
    const recorder = new RecordRTC.StereoAudioRecorder(stream, {
      type: 'audio',
      mimeType: 'audio/wav',
    });

    recorder.record();

    const sleep = (m: number) => new Promise(r => setTimeout(r, m));
    await sleep(5000);

    // For now while figuring out azure, just display the recorded audio in dom.
    recorder.stop((blob) => {
      console.log(blob);
      const url = URL.createObjectURL(blob);
      // All junk, will be removed later.
      document.querySelector('audio')!.src = url;
      document.querySelector('audio')!.muted = false;
      document.querySelector('audio')!.click();
    });
  }
}

export default AzureSttComponent;
