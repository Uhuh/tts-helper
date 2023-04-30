import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectIsTokenValid,
  selectTwitchChannelInfo,
  selectTwitchRedeems,
  selectTwitchState,
  selectTwitchToken,
  selectRedeemInfo,
  selectBitInfo,
  selectSubInfo,
} from '../state/twitch/twitch.selectors';
import { TwitchApi } from '../api/twitch.api';
import {
  updateBitEnabled,
  updateBitsCharLimit,
  updateChannelInfo,
  updateChannelRedeems,
  updateMinBits,
  updateRedeem,
  updateRedeemCharLimit,
  updateRedeemEnabled,
  updateSubCharLimit,
  updateSubEnabled,
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
  public readonly redeems$ = this.store.select(selectTwitchRedeems);
  public readonly isTokenValid$ = this.store.select(selectIsTokenValid);
  public readonly channelInfo$ = this.store.select(selectTwitchChannelInfo);

  public readonly subsInfo$ = this.store.select(selectSubInfo);
  public readonly redeemInfo$ = this.store.select(selectRedeemInfo);
  public readonly bitInfo$ = this.store.select(selectBitInfo);

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
          subsInfo: {
            enabled: true,
            subCharacterLimit: 300,
          },
          redeemInfo: {
            enabled: true,
            redeem: null,
            redeemCharacterLimit: 300,
          },
          bitInfo: {
            enabled: true,
            minBits: 100,
            bitsCharacterLimit: 300,
          },
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

  updateRedeemEnabled(enabled: boolean) {
    this.store.dispatch(updateRedeemEnabled({ enabled }));
  }

  updateBitEnabled(enabled: boolean) {
    this.store.dispatch(updateBitEnabled({ enabled }));
  }

  updateSubEnabled(enabled: boolean) {
    this.store.dispatch(updateSubEnabled({ enabled }));
  }

  updateSubCharLimit(subCharacterLimit: number) {
    this.store.dispatch(updateSubCharLimit({ subCharacterLimit }));
  }
}
