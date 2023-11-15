import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ElevenLabsModel, ElevenLabsVoice } from './eleven-labs.interface';
import { Store } from '@ngrx/store';
import { ElevenLabsFeature } from '../../state/eleven-labs/eleven-labs.feature';

@Injectable()
export class ElevenLabsApi {
  private readonly apiUrl = 'https://api.elevenlabs.io/v1';
  private apiKey = '';

  constructor(private readonly http: HttpClient, private readonly store: Store) {
    this.store.select(ElevenLabsFeature.selectApiKey)
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