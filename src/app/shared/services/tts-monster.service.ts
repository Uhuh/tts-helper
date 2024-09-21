import { inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { TtsMonsterApi } from '../api/tts-monster/tts-monster.api';
import { filter, switchMap, tap } from 'rxjs';

export type TtsMonsterVoice = {
  voice_id: string;
  name: string;
  sample: string;
  metadata: string;
};

export interface TtsMonsterState {
  apiKey: string;
  voices: TtsMonsterVoice[];
}

const initialState: TtsMonsterState = {
  apiKey: '',
  voices: [],
};

@Injectable()
export class TtsMonsterStateService extends ComponentStore<TtsMonsterState> {
  private readonly ttsMonsterApi = inject(TtsMonsterApi);
  readonly voices$ = this.select(state => state.voices);
  readonly apiKey$ = this.select(state => state.apiKey);

  readonly updateVoices = this.updater((state, voices: TtsMonsterVoice[]) => ({
    ...state,
    voices,
  }));

  readonly updateSettings = this.updater((state, settings: Partial<TtsMonsterState>) => ({
    ...state,
    ...settings,
  }));

  constructor() {
    super(initialState);

    this.apiKey$
      .pipe(
        filter(key => !!key),
        switchMap(key => this.ttsMonsterApi.getVoices(key)),
        tap(voices => this.updateVoices([...voices.voices, ...voices.customVoices])),
      )
      .subscribe();
  }
}