import { inject, Injectable, signal } from '@angular/core';
import { ObsWebSocketService } from '../../shared/services/obs-websocket.service';
import { createDefaultPngTtsModel, PNG_TTS_MODEL_DEFAULTS, PngTtsModel } from './assets/png-tts-generator';

@Injectable({ providedIn: 'root' })
export class PngTtsService {
  private readonly obs = inject(ObsWebSocketService);

  readonly models = signal<PngTtsModel[]>([]);
  readonly activeModel = signal(0);

  readonly connected = this.obs.pngTtsConnected;
  readonly sourceConfig = this.obs.pngTtsSourceConfig;
  readonly reportedCount = this.obs.pngTtsModelCount;
  readonly reportedNames = this.obs.pngTtsModelNames;

  addModel() {
    this.models.update(list => [...list, createDefaultPngTtsModel(list.length)]);
  }

  updateModel(index: number, model: PngTtsModel) {
    this.models.update(list => list.map((m, i) => i === index
      ? model
      : m));
  }

  removeModel(index: number) {
    this.models.update(list => list.filter((_, i) => i !== index));

    if (this.activeModel() >= this.models().length) {
      this.activeModel.set(Math.max(0, this.models().length - 1));
    }
  }

  importFromSource() {
    const config = this.sourceConfig();
    if (!config) {
      return;
    }

    this.models.set(config.models.map(m => ({ ...PNG_TTS_MODEL_DEFAULTS, ...m })));
    this.activeModel.set(0);
  }

  selectModel(index: number) {
    this.activeModel.set(index);
    this.obs.sendSelectPngModel(index);
  }
}
