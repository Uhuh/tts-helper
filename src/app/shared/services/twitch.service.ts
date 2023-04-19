import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectIsTokenValid,
  selectRedeemCharLimit,
  selectRedeem,
  selectTwitchChannelInfo,
  selectTwitchRedeems,
  selectTwitchState,
  selectTwitchToken,
} from '../state/twitch/twitch.selectors';
import { TwitchApi } from '../api/twitch.api';
import {
  updateChannelInfo,
  updateRedeem,
  updateRedeemCharLimit,
} from '../state/twitch/twitch.actions';
import { TwitchRedeemInfo } from '../state/twitch/twitch.interface';

@Injectable()
export class TwitchService {
  public readonly twitchState$ = this.store.select(selectTwitchState);
  public readonly twitchToken$ = this.store.select(selectTwitchToken);
  public readonly isTokenValid$ = this.store.select(selectIsTokenValid);
  public readonly channelInfo$ = this.store.select(selectTwitchChannelInfo);
  public readonly redeems$ = this.store.select(selectTwitchRedeems);
  public readonly redeem$ = this.store.select(selectRedeem);
  public readonly redeemCharLimit$ = this.store.select(selectRedeemCharLimit);

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

  updateSelectedRedeem(redeem: string | null) {
    this.store.dispatch(updateRedeem({ redeem }));
  }

  updateRedeemCharLimit(redeemCharacterLimit: number) {
    this.store.dispatch(updateRedeemCharLimit({ redeemCharacterLimit }));
  }
}
