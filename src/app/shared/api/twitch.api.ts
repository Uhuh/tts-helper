import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LOCAL_STORAGE } from '../tokens/localStorage.token';
import { Observable } from 'rxjs';
import {
  updateChannelRedeems,
  updateTwitchState,
} from '../state/twitch/twitch.actions';
import { Store } from '@ngrx/store';
import { TwitchRedeemInfo, ValidUser } from '../state/twitch/twitch.interface';
import { TwitchRedeem } from './twitch.interface';
import { OnDestroy } from '@angular/core';
import { switchMap, Subject, takeUntil } from 'rxjs';

@Injectable()
export class TwitchApi implements OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  private readonly apiUrl = 'https://api.twitch.tv/helix';
  private readonly url = 'https://id.twitch.tv';
  private readonly clientId = 'fprxp4ve0scf8xg6y48nwcq1iogxuq';
  private readonly storageKey = 'twitchAccessToken';
  private headers: HttpHeaders;

  constructor(
    @Inject(LOCAL_STORAGE) private readonly localStorage: Storage,
    private readonly http: HttpClient,
    private readonly store: Store
  ) {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `OAuth ${this.localStorage.getItem(this.storageKey)}`,
      'Client-Id': this.clientId,
    });

    this.getTokenFromStorage();
  }

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
    broadcasterId: string
  ): Observable<{ data: TwitchRedeem[] }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.localStorage.getItem(this.storageKey)}`,
      'Client-Id': this.clientId,
    });

    return this.http.get<{ data: any[] }>(
      `${this.apiUrl}/channel_points/custom_rewards`,
      {
        headers,
        params: {
          broadcaster_id: broadcasterId,
        },
      }
    );
  }

  getTokenFromStorage() {
    const token = this.localStorage.getItem(this.storageKey);

    this.headers = new HttpHeaders({
      Authorization: `OAuth ${token}`,
    });

    // When launching we need to verify the users token is still valid. Who knows how long they waited.
    this.handleValidateToken(token);
  }

  updateStorage(token: string | null) {
    if (token) {
      this.localStorage.setItem(this.storageKey, token);
    } else {
      this.localStorage.removeItem(this.storageKey);
    }
  }

  updateToken(token: string | null) {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `OAuth ${token}`,
    });

    return this.handleValidateToken(token);
  }

  handleValidateToken(token: string | null) {
    return this.validateToken()
      .pipe(
        takeUntil(this.destroyed$),
        switchMap((validUser: ValidUser) => {
          this.updateStorage(token);

          const twitchState = {
            isTokenValid: true,
            token,
            redeem: null,
            redeemCharacterLimit: 300,
            channelInfo: {
              channelId: validUser.user_id,
              username: validUser.login,
              redeems: [],
            },
          };

          this.store.dispatch(
            updateTwitchState({
              twitchState,
            })
          );

          return this.getChannelRedeemCommands(validUser.user_id);
        })
      )
      .subscribe({
        next: (twitchRedeems) => {
          const redeems = twitchRedeems.data
            .filter((r) => r.is_enabled)
            .map<TwitchRedeemInfo>((r) => ({
              cost: r.cost ?? 0,
              id: r.id,
              prompt: r.prompt,
              title: r.title,
            }));

          this.store.dispatch(updateChannelRedeems({ redeems }));
        },

        error: (err) => {
          console.error('Failed to validate users access token.', err);
          this.updateStorage(null);

          const twitchState = {
            isTokenValid: false,
            token: null,
            redeem: null,
            redeemCharacterLimit: 300,
            channelInfo: {
              channelId: '',
              username: '',
              redeems: [],
            },
          };

          this.store.dispatch(
            updateTwitchState({
              twitchState,
            })
          );
        },
      });
  }

  validateToken(): Observable<ValidUser> {
    return this.http.get<ValidUser>(`${this.url}/oauth2/validate`, {
      headers: this.headers,
    });
  }
}
