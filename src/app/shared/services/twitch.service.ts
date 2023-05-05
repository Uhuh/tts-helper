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
  twitchBitsInfo,
  twitchInfo,
  twitchRedeemInfo,
  twitchSubInfo,
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
      twitchInfo.twitchState({
        twitchState: {
          isTokenValid: false,
          token: null,
          subsInfo: {
            enabled: true,
            giftMessage: '',
            subCharacterLimit: 300,
          },
          redeemInfo: {
            enabled: true,
            redeem: null,
            redeemCharacterLimit: 300,
          },
          bitInfo: {
            enabled: true,
            exact: false,
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
          this.store.dispatch(twitchInfo.token({ token }));
          this.store.dispatch(twitchInfo.isTokenValid({ isTokenValid: true }));
          this.store.dispatch(
            twitchInfo.channelInfo({
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
            twitchInfo.redeems({
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

  updateRedeemEnabled(enabled: boolean) {
    this.store.dispatch(twitchRedeemInfo.enabled({ enabled }));
  }

  updateSelectedRedeem(redeem: string | null) {
    this.store.dispatch(twitchRedeemInfo.redeem({ redeem }));
  }

  updateRedeemCharLimit(redeemCharacterLimit: number) {
    this.store.dispatch(
      twitchRedeemInfo.redeemCharLimit({ redeemCharacterLimit })
    );
  }

  updateMinBits(minBits: number) {
    this.store.dispatch(twitchBitsInfo.minBits({ minBits }));
  }

  updateBitsCharLimit(bitsCharacterLimit: number) {
    this.store.dispatch(twitchBitsInfo.bitsCharLimit({ bitsCharacterLimit }));
  }

  updateBitsEnabled(enabled: boolean) {
    this.store.dispatch(twitchBitsInfo.enabled({ enabled }));
  }

  updateBitsExact(exact: boolean) {
    this.store.dispatch(twitchBitsInfo.exact({ exact }));
  }

  updateSubEnabled(enabled: boolean) {
    this.store.dispatch(twitchSubInfo.enabled({ enabled }));
  }

  updateGiftMessage(giftMessage: string) {
    this.store.dispatch(twitchSubInfo.giftMessage({ giftMessage }));
  }

  updateSubCharLimit(subCharacterLimit: number) {
    this.store.dispatch(twitchSubInfo.subCharLimit({ subCharacterLimit }));
  }
}
