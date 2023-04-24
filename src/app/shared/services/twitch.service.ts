import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectIsTokenValid,
  selectRedeemCharLimit,
  selectRedeem,
  selectTwitchChannelInfo,
  selectTwitchRedeems,
  selectTwitchState,
  selectTwitchToken,
  selectMinBits,
  selectBitsCharLimit,
} from '../state/twitch/twitch.selectors';
import { TwitchApi } from '../api/twitch.api';
import {
  updateBitsCharLimit,
  updateChannelInfo,
  updateChannelRedeems,
  updateMinBits,
  updateRedeem,
  updateRedeemCharLimit,
  updateToken,
  updateTokenValidity,
  updateTwitchState,
} from '../state/twitch/twitch.actions';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { listen } from '@tauri-apps/api/event';
import { ValidUser } from '../state/twitch/twitch.interface';

@Injectable()
export class TwitchService implements OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  public readonly twitchState$ = this.store.select(selectTwitchState);
  public readonly twitchToken$ = this.store.select(selectTwitchToken);
  public readonly isTokenValid$ = this.store.select(selectIsTokenValid);
  public readonly channelInfo$ = this.store.select(selectTwitchChannelInfo);
  public readonly redeems$ = this.store.select(selectTwitchRedeems);
  public readonly redeem$ = this.store.select(selectRedeem);
  public readonly redeemCharLimit$ = this.store.select(selectRedeemCharLimit);
  public readonly minBits$ = this.store.select(selectMinBits);
  public readonly bitsCharLimit$ = this.store.select(selectBitsCharLimit);

  constructor(
    private readonly store: Store,
    private readonly twitchApi: TwitchApi
  ) {
    this.twitchToken$.pipe(takeUntil(this.destroyed$)).subscribe((token) => {
      /**
       * @TODO - If token is not null, setup validation.
       */
    });

    listen('access-token', (authData) => {
      const { token, provider } = authData.payload as {
        token: string;
        provider: 'twitch' | 'youtube';
      };

      if (provider !== 'twitch') {
        return;
      }

      this.signIn(token);
    }).catch((e) => {
      console.error('Encountered issue getting access token.', e);
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  clearState() {
    this.store.dispatch(
      updateTwitchState({
        twitchState: {
          isTokenValid: false,
          token: null,
          redeem: null,
          redeemCharacterLimit: 300,
          minBits: 100,
          bitsCharacterLimit: 300,
          channelInfo: {
            channelId: '',
            username: '',
            redeems: [],
          },
        },
      })
    );
  }

  signOut() {
    this.clearState();
  }

  signIn(token: string) {
    this.twitchApi
      .validateToken(token)
      .pipe(
        takeUntil(this.destroyed$),
        switchMap((user: ValidUser) => {
          console.info(user);

          this.store.dispatch(updateToken({ token }));
          this.store.dispatch(updateTokenValidity({ isTokenValid: true }));
          this.store.dispatch(
            updateChannelInfo({
              channelInfo: {
                username: user.login,
                channelId: user.user_id,
                redeems: [],
              },
            })
          );

          return this.twitchApi.getChannelRedeemCommands(user.user_id, token);
        })
      )
      .subscribe({
        next: (data) => {
          this.store.dispatch(
            updateChannelRedeems({
              redeems: data.data.map((r) => ({
                cost: r.cost,
                id: r.id,
                prompt: r.prompt,
                title: r.title,
              })),
            })
          );
        },
        error: (e) => console.error(e),
      });
  }

  updateSelectedRedeem(redeem: string | null) {
    this.store.dispatch(updateRedeem({ redeem }));
  }

  updateRedeemCharLimit(redeemCharacterLimit: number) {
    this.store.dispatch(updateRedeemCharLimit({ redeemCharacterLimit }));
  }

  updateMinBits(minBits: number) {
    this.store.dispatch(updateMinBits({ minBits }));
  }

  updateBitsCharLimit(bitsCharacterLimit: number) {
    this.store.dispatch(updateBitsCharLimit({ bitsCharacterLimit }));
  }
}
