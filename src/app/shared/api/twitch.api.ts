import { ChangeDetectorRef, Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LOCAL_STORAGE } from "../tokens/localStorage.token";
import { first, Observable, Subject } from "rxjs";
import { updateChannelInfo, updateToken, updateTokenValidity } from "../state/twitch/twitch.actions";
import { Store } from "@ngrx/store";
import { ValidUser } from "../state/twitch/twitch.interface";

@Injectable()
export class TwitchApi {
  private readonly url = 'https://id.twitch.tv';
  private readonly storageKey = 'twitchAccessToken';
  private headers: HttpHeaders;
  
  constructor(
    @Inject(LOCAL_STORAGE) private readonly localStorage: Storage,
    private readonly http: HttpClient,
    private readonly store: Store,
  ) {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `OAuth ${this.localStorage.getItem(this.storageKey)}`,
    });
    
    this.getTokenFromStorage();
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
    return this.validateToken(token ?? '')
      .subscribe(
        {
          next: (validData: ValidUser) => {
            this.store.dispatch(updateTokenValidity({ isTokenValid: true }));
            this.updateStorage(token);
            this.store.dispatch(updateToken({ token }));
            this.store.dispatch(updateChannelInfo( {
              channelInfo: {
                channelId: validData.user_id,
                username: validData.login
              }
            }));
          },
          error: (err) => {
            console.error('Failed to validate users access token.', err);
            this.updateStorage(null);
            this.store.dispatch(updateToken({ token: null }));
            this.store.dispatch(updateTokenValidity({ isTokenValid: false }));
          },
        }
      );
  }

  validateToken(token: string): Observable<ValidUser> {
    return this.http.get<ValidUser>(`${this.url}/oauth2/validate`, {
      headers: this.headers
    });
  }
}