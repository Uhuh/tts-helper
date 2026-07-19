import { Component, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AudioService } from '../../../shared/services/audio.service';
import { PngTtsService } from '../png-tts.service';
import { PngTtsModelAccordionComponent } from '../png-tts-model-accordion/png-tts-model-accordion.component';
import { saveTextFile } from '../../../shared/util/save-file';
import {
  PngTtsConfig,
  PngTtsModel,
  pngTtsConfigFile,
  pngTtsGenerator,
} from '../assets/png-tts-generator';

@Component({
  selector: 'app-png-tts-configure',
  imports: [
    ButtonComponent,
    PngTtsModelAccordionComponent,
  ],
  templateUrl: './png-tts-configure.component.html',
  styleUrl: './png-tts-configure.component.scss',
})
export class PngTtsConfigureComponent {
  private readonly snackbar = inject(MatSnackBar);
  private readonly audioService = inject(AudioService);
  protected readonly service = inject(PngTtsService);

  readonly previewModel = signal<PngTtsModel | null>(null);

  showPreview(model: PngTtsModel) {
    this.previewModel.set(model);
  }

  clearPreview() {
    this.previewModel.set(null);
  }

  testAudio() {
    this.audioService.playTts(`I'm talking now!`, '', 'tts-helper', 1000, true);
  }

  async downloadHtml() {
    const saved = await saveTextFile(
      'tts-helper-png-tts.html',
      'text/html',
      pngTtsGenerator(this.buildConfig()),
      { name: 'HTML', extensions: ['html'] },
    );

    if (!saved) {
      return;
    }

    this.snackbar.open('Successfully saved PNG TTS file.', 'Dismiss', {
      panelClass: 'notification-success',
      duration: 3000,
    });
  }

  async downloadConfig() {
    const saved = await saveTextFile(
      'png-tts-config.js',
      'text/javascript',
      pngTtsConfigFile(this.buildConfig()),
      { name: 'JavaScript', extensions: ['js'] },
    );

    if (!saved) {
      return;
    }

    this.snackbar.open('Successfully saved PNG TTS config file.', 'Dismiss', {
      panelClass: 'notification-success',
      duration: 3000,
    });
  }

  private buildConfig(): PngTtsConfig {
    return {
      models: this.service.models().map(m => ({
        ...m,
        extension: this.cleanExtension(m.extension),
      })),
    };
  }

  private cleanExtension(extension: string): string {
    return extension.replace(/^\./, '').trim().toLowerCase() || 'png';
  }
}

export default PngTtsConfigureComponent;
