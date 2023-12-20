import { Injectable } from '@angular/core';
import { VStreamApi } from '../api/vstream/vstream.api';
import { listen } from '@tauri-apps/api/event';
import { LogService } from './logs.service';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  first,
  from,
  interval,
  map,
  of,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import { Store } from '@ngrx/store';
import { VStreamActions } from '../state/vstream/vstream.actions';
import { VStreamCustomMessageState, VStreamFeature, VStreamSettingsState } from '../state/vstream/vstream.feature';
import { VStreamVideoID } from './vstream-pubsub.interface';

@Injectable({
  providedIn: 'root',
})
export class VStreamService {
  readonly state$ = this.store.select(VStreamFeature.selectVStreamFeatureState);
  readonly token$ = this.store.select(VStreamFeature.selectToken);
  readonly settings$ = this.store.select(VStreamFeature.selectSettings);
  readonly channelInfo$ = this.store.select(VStreamFeature.selectChannelInfo);
  readonly upliftSettings$ = this.store.select(VStreamFeature.selectUplift);
  readonly subscriptionSettings$ = this.store.select(VStreamFeature.selectSubscriptions);
  readonly meteorShowerSettings$ = this.store.select(VStreamFeature.selectMeteorShower);
  readonly followerSettings$ = this.store.select(VStreamFeature.selectFollowers);

  readonly liveStreamID$ = new BehaviorSubject<VStreamVideoID | null>(null);

  readonly isTokenValid$ = interval(1000)
    .pipe(switchMap(() => {
      return this.token$.pipe(map(token => token.expireDate > Date.now() && token.accessToken));
    }));

  constructor(
    private readonly store: Store,
    private readonly vstreamApi: VStreamApi,
    private readonly logService: LogService,
  ) {
    listen('access-token', (authData) => {
      this.logService.add(`Attempting VStream signin with code. ${JSON.stringify(authData, undefined, 2)}.`, 'info', 'VStreamService.constructor');

      const { token, provider } = authData.payload as {
        token: string;
        provider: 'twitch' | 'youtube' | 'vstream';
      };

      if (provider !== 'vstream') {
        return;
      }

      this.vstreamApi.validate(token)
        .subscribe({
          next: (tokenResponse) => {
            this.logService.add(`Validated users VStream code and got token response`, 'info', 'VStreamService.validate');

            this.store.dispatch(VStreamActions.updateToken({ token: tokenResponse }));
          },
          error: (error) => {
            this.logService.add(`Failed to validate users code for VStream\n${JSON.stringify(error, undefined, 2)}`, 'error', 'VStreamService.validate');
          },
        });
    }).catch((e) => {
      this.logService.add(`Failed to get VStream code from server.\n${JSON.stringify(e, undefined, 2)}`, 'error', 'VStreamService.constructor');
    });

    /**
     * The handles refreshing the users tokens 1 minute before it expires.
     */
    this.token$
      .pipe(
        map(token => {
          const now = Date.now();
          const earlyExpires = token.expireDate > now ? token.expireDate - (60 * 1000) : -1;
          return { token, earlyExpires };
        }),
        switchMap(({ token, earlyExpires }) => {
          return timer(new Date(earlyExpires)).pipe(
            switchMap(() => {
              this.logService.add('Attempting to refreshing VStream token.', 'info', 'VStreanService.constructor');

              return this.vstreamApi.refreshAccessToken(token.refreshToken);
            }),
            map(refreshedToken => this.store.dispatch(VStreamActions.updateToken({ token: refreshedToken }))),
            catchError(err => {
              this.logService.add(`Failed to refresh VStream token.\n${JSON.stringify(err, undefined, 2)}`, 'error', 'VStreanService.constructor');

              return of();
            }),
          );
        }),
      )
      .subscribe();

    /**
     * Check if the user is currently live on VStream so that they can use the chat message feature
     */
    interval(3000)
      .pipe(
        switchMap(() => {
          return combineLatest([this.token$, this.channelInfo$]);
        }),
        switchMap(([token, channelInfo]) => {
          if (!channelInfo.username || !token.accessToken) {
            return of(null);
          }

          return this.vstreamApi.findStream(token.accessToken, channelInfo.channelId);
        }),
        map(data => {
          if (!data?.data) {
            return;
          }

          this.liveStreamID$.next(data.data.id);
        }),
        catchError((err) => {
          this.logService.add(`Failed to find VStream video ID.\n${JSON.stringify(err, undefined, 2)}`, 'error', 'VStreamService.interval');

          return of(null);
        }),
      )
      .subscribe();
  }

  authenticatePubSub(token: string) {
    return this.vstreamApi.authenticatePubSub(token);
  }

  getLoginURL() {
    return from(this.vstreamApi.generateAuthURL());
  }

  signOut() {
    this.store.dispatch(VStreamActions.clearToken());
  }

  updateSettings(partialSettings: Partial<VStreamSettingsState>) {
    this.store.dispatch(VStreamActions.updateSettings({ partialSettings }));
  }

  /**
   * This works well because these settings are identical for now
   * Once more custom things start getting added this will be broken up.
   */
  updateCustomMessageSettings(
    partialSettings: Partial<VStreamCustomMessageState>,
    type: 'uplift' | 'meteor' | 'sub-renew' | 'sub-gifted' | 'follower',
  ) {
    switch (type) {
      case 'meteor':
        this.store.dispatch(VStreamActions.updateMeteorShower({ partialSettings }));
        break;
      case 'uplift':
        this.store.dispatch(VStreamActions.updateUpLift({ partialSettings }));
        break;
      case 'sub-renew':
        this.store.dispatch(VStreamActions.updateRenewalSubscriptions({ partialSettings }));
        break;
      case 'sub-gifted':
        this.store.dispatch(VStreamActions.updateGiftedSubscriptions({ partialSettings }));
        break;
      case 'follower':
        this.store.dispatch(VStreamActions.updateFollowers({ partialSettings }));
        break;
      default:
        return;
    }
  }

  postChannelMessage(text: string) {
    return combineLatest([this.token$, this.channelInfo$, this.liveStreamID$])
      .pipe(
        first(),
        switchMap(([token, channelInfo, videoID]) => {
          if (!videoID) {
            throw Error('Tried to post a channel message when the video ID was not found.');
          }

          return this.vstreamApi.postChannelMessage(text, token.accessToken, channelInfo.channelId, videoID);
        }))
      .subscribe({
        error: err => {
          this.logService.add(`Failed to post channel message: ${JSON.stringify(err, undefined, 2)}`, 'error', 'VStreamService.postChannelMessage');
        },
      });
  }

  /**
   * @TODO - This should be a temporary thing until the access token includes the channel id claim.
   */
  updateChannelId(username: string) {
    return this.token$
      .pipe(
        switchMap(token => this.vstreamApi.getUsersChannelId(username, token.accessToken)),
        tap(channelID => {
          this.store.dispatch(VStreamActions.updateChannel({
            partialChannel: {
              username,
              channelId: channelID.data.id,
            },
          }));
        }),
        catchError(() => {
          this.store.dispatch(VStreamActions.updateChannel({
            partialChannel: {
              username: '',
              channelId: 'chan_',
            },
          }));

          return of({ data: { id: '' } });
        }),
      );
  }
}