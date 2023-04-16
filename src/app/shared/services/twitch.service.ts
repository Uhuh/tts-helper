import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectIsTokenValid,
  selectTwitchChannelInfo,
  selectTwitchToken,
} from '../state/twitch/twitch.selectors';
import { TwitchApi } from '../api/twitch.api';
import { updateChannelInfo } from '../state/twitch/twitch.actions';

@Injectable()
export class TwitchService {
  public readonly twitchToken$ = this.store.select(selectTwitchToken);
  public readonly isTokenValid$ = this.store.select(selectIsTokenValid);
  public readonly channelInfo$ = this.store.select(selectTwitchChannelInfo);

  constructor(
    private readonly store: Store,
    private readonly twitchApi: TwitchApi
  ) {}

  signOut() {
    this.twitchApi.updateToken('');
    this.store.dispatch(
      updateChannelInfo({
        channelInfo: {
          channelId: '',
          username: '',
        },
      })
    );
  }

  updateToken(token: string) {
    return this.twitchApi.updateToken(token);
  }

  getChannelInfo() {}
  validateToken(token: string) {}
}
