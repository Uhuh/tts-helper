import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ElevenLabsFeature, ElevenLabsState } from '../state/eleven-labs/eleven-labs.feature';
import { ElevenLabsActions } from '../state/eleven-labs/eleven-labs.actions';
import { ElevenLabsApi } from '../api/eleven-labs/eleven-labs.api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

@Injectable()
export class ElevenLabsService {
  public readonly apiKey$ = this.store.select(ElevenLabsFeature.selectApiKey);
  public readonly state$ = this.store.select(ElevenLabsFeature.selectElevenLabsState);
  public readonly apiUrl = 'https://api.elevenlabs.io/v1';

  constructor(private readonly store: Store, private readonly elevenLabsApi: ElevenLabsApi) {
    this.apiKey$
      .pipe(
        takeUntilDestroyed(),
        switchMap(() => this.elevenLabsApi.getVoices()),
        switchMap(({ voices }) => {
          this.store.dispatch(ElevenLabsActions.updateState({ partialState: { voices } }));

          return this.elevenLabsApi.getModels();
        }),
      ).subscribe((models) => {
        this.store.dispatch(ElevenLabsActions.updateState({ partialState: { models } }));
      },
    );
  }

  updateState(partialState: Partial<ElevenLabsState>) {
    this.store.dispatch(ElevenLabsActions.updateState({ partialState }));
  }
}