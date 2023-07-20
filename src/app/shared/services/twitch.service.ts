import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { TwitchApi } from '../api/twitch.api';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { listen } from '@tauri-apps/api/event';
import { twitchFeature, ValidUser } from '../state/twitch/twitch.feature';
import { TwitchStateActions } from '../state/twitch/twitch.actions';

@Injectable()
export class TwitchService implements OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  public readonly twitchState$ = this.store.select(twitchFeature.selectTwitchStateState);
  public readonly twitchToken$ = this.store.select(twitchFeature.selectToken);
  public readonly redeems$ = this.store.select(twitchFeature.selectRedeems);
  public readonly isTokenValid$ = this.store.select(twitchFeature.selectIsTokenValid);
  public readonly channelInfo$ = this.store.select(twitchFeature.selectChannelInfo);

  public readonly subsInfo$ = this.store.select(twitchFeature.selectSubsInfo);
  public readonly redeemInfo$ = this.store.select(twitchFeature.selectRedeemInfo);
  public readonly bitInfo$ = this.store.select(twitchFeature.selectBitInfo);

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
    this.store.dispatch(TwitchStateActions.resetState());
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
            this.store.dispatch(TwitchStateActions.updateToken({ token }));
            this.store.dispatch(TwitchStateActions.updateIsTokenValid({ isTokenValid: true }));
            this.store.dispatch(
              TwitchStateActions.updateChannelInfo({
                channelInfo: {
                  username: user.login,
                  channelId: user.user_id,
                  redeems: [],
                },
              }),
            );

            return this.twitchApi.getChannelRedeemCommands(user.user_id, token);
          })
        )
        .subscribe({
          next: (data) => {
            this.store.dispatch(
              TwitchStateActions.updateRedeems({
                redeems: data.data.map((r) => ({
                  cost: r.cost,
                  id: r.id,
                  prompt: r.prompt,
                  title: r.title,
                })),
              })
            );
          },
          error: (e) => {
            // Token has most likely expired.
            this.clearState();
            console.error(`Failed to log user in.`, e)
          },
        });
  }

  updateRedeemEnabled(enabled: boolean) {
    this.store.dispatch(TwitchStateActions.updateRedeemEnabled({ enabled }));
  }

  updateSelectedRedeem(redeem: string | null) {
    this.store.dispatch(TwitchStateActions.updateSelectedRedeem({ redeem }));
  }

  updateRedeemCharLimit(redeemCharacterLimit: number) {
    this.store.dispatch(
      TwitchStateActions.updateRedeemCharLimit({ redeemCharacterLimit })
    );
  }

  updateMinBits(minBits: number) {
    this.store.dispatch(TwitchStateActions.updateBitsMin({ minBits }));
  }

  updateBitsCharLimit(bitsCharacterLimit: number) {
    this.store.dispatch(TwitchStateActions.updateBitsCharLimit({ bitsCharacterLimit }));
  }

  updateBitsEnabled(enabled: boolean) {
    this.store.dispatch(TwitchStateActions.updateBitsEnabled({ enabled }));
  }

  updateBitsExact(exact: boolean) {
    this.store.dispatch(TwitchStateActions.updateBitsExact({ exact }));
  }

  updateSubEnabled(enabled: boolean) {
    this.store.dispatch(TwitchStateActions.updateSubEnabled({ enabled }));
  }

  updateGiftMessage(giftMessage: string) {
    this.store.dispatch(TwitchStateActions.updateSubGiftMessage({ giftMessage }));
  }

  updateSubCharLimit(subCharacterLimit: number) {
    this.store.dispatch(TwitchStateActions.updateSubCharLimit({ subCharacterLimit }));
  }
}
