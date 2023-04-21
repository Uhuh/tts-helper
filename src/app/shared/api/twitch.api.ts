import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TwitchRedeem } from './twitch.interface';
import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class TwitchApi implements OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  private readonly apiUrl = 'https://api.twitch.tv/helix';
  private readonly url = 'https://id.twitch.tv';
  private readonly clientId = 'fprxp4ve0scf8xg6y48nwcq1iogxuq';

  constructor(private readonly http: HttpClient) {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  /**
   * Get channels possible redeems so they can configure TTS for each redeem.
   * @param broadcasterId
   * @returns Array of redeems that belong to the broadcaster id.
   */
  getChannelRedeemCommands(
    broadcaster_id: string,
    token: string
  ): Observable<{ data: TwitchRedeem[] }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'Client-Id': this.clientId,
    });

    return this.http.get<{ data: TwitchRedeem[] }>(
      `${this.apiUrl}/channel_points/custom_rewards`,
      {
        headers,
        params: {
          broadcaster_id,
        },
      }
    );
  }

  validateToken(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `OAuth ${token}`,
    });

    return this.http.get<any>(`${this.url}/oauth2/validate`, {
      headers,
    });
  }
}
