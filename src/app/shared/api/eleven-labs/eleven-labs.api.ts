import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ElevenLabsModel, ElevenLabsVoice } from './eleven-labs.interface';
import { Store } from '@ngrx/store';
import { ElevenLabsFeature } from '../../state/eleven-labs/eleven-labs.feature';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class ElevenLabsApi {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly apiUrl = 'https://api.elevenlabs.io/v1';
  private apiKey = '';

  constructor() {
    this.store.select(ElevenLabsFeature.selectApiKey)
      .pipe(takeUntilDestroyed())
      .subscribe(apiKey => this.apiKey = apiKey);
  }

  getVoices() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'xi-api-key': this.apiKey,
    });

    return this.http.get<{ voices: ElevenLabsVoice[] }>(
      `${this.apiUrl}/voices`,
      {
        headers,
      },
    );
  }

  getModels() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'xi-api-key': this.apiKey,
    });

    return this.http.get<ElevenLabsModel[]>(
      `${this.apiUrl}/models`,
      {
        headers,
      },
    );
  }
}