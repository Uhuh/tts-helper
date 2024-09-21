import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TtsMonsterVoice } from '../../services/tts-monster.service';

@Injectable()
export class TtsMonsterApi {
  private readonly baseUrl = 'https://api.console.tts.monster' as const;
  private readonly http = inject(HttpClient);

  getVoices(apiKey: string) {
    const headers = new HttpHeaders({
      Authorization: `${apiKey}`,
    });

    return this.http.post<{
      voices: TtsMonsterVoice[],
      customVoices: TtsMonsterVoice[]
    }>(`${this.baseUrl}/voices`, {}, { headers });
  }
}