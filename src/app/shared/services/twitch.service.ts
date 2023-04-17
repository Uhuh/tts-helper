import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectIsTokenValid,
  selectSelectedRedeem,
  selectTwitchChannelInfo,
  selectTwitchRedeems,
  selectTwitchToken,
} from '../state/twitch/twitch.selectors';
import { TwitchApi } from '../api/twitch.api';
import {
  updateChannelInfo,
  updateSelectedRedeem,
} from '../state/twitch/twitch.actions';
import { TwitchRedeemInfo } from '../state/twitch/twitch.interface';

@Injectable()
export class TwitchService {
  public readonly twitchToken$ = this.store.select(selectTwitchToken);
  public readonly isTokenValid$ = this.store.select(selectIsTokenValid);
  public readonly channelInfo$ = this.store.select(selectTwitchChannelInfo);
  public readonly redeems$ = this.store.select(selectTwitchRedeems);
  public readonly selectedRedeem$ = this.store.select(selectSelectedRedeem);

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
          redeems: [],
        },
      })
    );
  }

  getChannelRedeemCommands(broadcasterId: string) {
    return this.twitchApi.getChannelRedeemCommands(broadcasterId);
  }

  updateToken(token: string) {
    return this.twitchApi.updateToken(token);
  }

  updateSelectedRedeem(redeem: TwitchRedeemInfo | null) {
    this.store.dispatch(
      updateSelectedRedeem({ selectedRedeem: redeem || null })
    );
  }
}
