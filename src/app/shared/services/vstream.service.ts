import { DestroyRef, inject, Injectable } from '@angular/core';
import { VStreamApi } from '../api/vstream/vstream.api';
import { listen } from '@tauri-apps/api/event';
import { LogService } from './logs.service';
import { BehaviorSubject, catchError, combineLatest, first, from, interval, map, of, switchMap, timer } from 'rxjs';
import { Store } from '@ngrx/store';
import { VStreamActions } from '../state/vstream/vstream.actions';
import {
  VStreamCustomMessageState,
  VStreamFeature,
  VStreamSettingsState,
  VStreamWidget,
} from '../state/vstream/vstream.feature';
import { VStreamChannelID, VStreamVideoID } from './vstream-pubsub.interface';
import { ChatCommand, ChatPermissions } from './chat.interface';
import { jwtDecode } from 'jwt-decode';
import { TypeID } from 'typeid-js';
import { Commands, CommandTypes } from './command.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class VStreamService {
  private readonly store = inject(Store);
  private readonly vstreamApi = inject(VStreamApi);
  private readonly logService = inject(LogService);
  private readonly destroyRef = inject(DestroyRef);

  readonly state$ = this.store.select(VStreamFeature.selectVStreamFeatureState);
  readonly token$ = this.store.select(VStreamFeature.selectToken);
  readonly settings$ = this.store.select(VStreamFeature.selectSettings);
  readonly channelInfo$ = this.store.select(VStreamFeature.selectChannelInfo);
  readonly upliftSettings$ = this.store.select(VStreamFeature.selectUplift);
  readonly subscriptionSettings$ = this.store.select(VStreamFeature.selectSubscriptions);
  readonly meteorShowerSettings$ = this.store.select(VStreamFeature.selectMeteorShower);
  readonly followerSettings$ = this.store.select(VStreamFeature.selectFollowers);
  readonly commands$ = this.store.select(VStreamFeature.selectCommands);
  /**
   * @TODO - REMOVE THIS AFTER A FEW VERSIONS SO USERS HAVE TIME TO GET THEIR COMMANDS MIGRATED
   */
  readonly chatCommands$ = this.store.select(VStreamFeature.selectChatCommands);
  readonly widgets$ = this.store.select(VStreamFeature.selectWidgets);

  readonly liveStreamID$ = new BehaviorSubject<VStreamVideoID | null>(null);
  readonly isTokenValid$ = interval(1000)
    .pipe(switchMap(() => {
      return this.token$.pipe(map(token => token.expireDate > Date.now() && token.accessToken));
    }));

  constructor() {
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

            const { id_token } = tokenResponse;
            const { sub } = jwtDecode(id_token);

            if (sub) {
              const chanType = TypeID.fromUUID('chan', sub);
              const channelId: VStreamChannelID = `${chanType.getType()}_${chanType.getSuffix()}`;
              this.store.dispatch(VStreamActions.updateChannel({ partialChannel: { channelId } }));
            }

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
        takeUntilDestroyed(),
        map(token => {
          const now = Date.now();
          const earlyExpires = token.expireDate > now ? token.expireDate - (60 * 1000) : -1;
          return { token, earlyExpires };
        }),
        switchMap(({ token, earlyExpires }) => {
          return timer(new Date(earlyExpires)).pipe(
            takeUntilDestroyed(this.destroyRef),
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
        takeUntilDestroyed(),
        switchMap(() => {
          return combineLatest([this.token$, this.channelInfo$]).pipe(first());
        }),
        switchMap(([token, channelInfo]) => {
          if (!channelInfo.channelId || !token.accessToken) {
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

  updateCommandSettings(partialCommand: Partial<Commands>, commandID: string) {
    this.store.dispatch(VStreamActions.updateCommand({ partialCommand, commandID }));
  }

  /**
   * @TODO - REMOVE THIS AFTER A FEW VERSIONS SO USERS HAVE TIME TO GET THEIR COMMANDS MIGRATED
   */
  migrateChatCommands(chatCommand: ChatCommand) {
    this.store.dispatch(VStreamActions.migrateChatCommand({ chatCommand }));
  }

  /**
   * @TODO - REMOVE THIS AFTER A FEW VERSIONS SO USERS HAVE TIME TO GET THEIR COMMANDS MIGRATED
   */
  removeOldChatCommands() {
    this.store.dispatch(VStreamActions.removeOldChatCommands());
  }

  updateCommandPermissions(partialPermissions: Partial<ChatPermissions>, commandID: string) {
    this.store.dispatch(VStreamActions.updateChatCommandPermissions({ partialPermissions, commandID }));
  }

  deleteCommand(commandID: string) {
    this.store.dispatch(VStreamActions.deleteChatCommand({ commandID }));
  }

  updateCommandType(newType: CommandTypes, commandID: string) {
    this.store.dispatch(VStreamActions.updateCommandType({ newType, commandID }));
  }

  createChatCommand() {
    this.store.dispatch(VStreamActions.createChatCommand());
  }

  createChainCommand(commandID: string, chainCommandID: string | null) {
    this.store.dispatch(VStreamActions.createChainCommand({ commandID, chainCommandID }));
  }

  updateChainCommand(commandID: string, chainCommandID: string, chainCommand: string | null) {
    this.store.dispatch(VStreamActions.updateChainCommand({ commandID, chainCommandID, chainCommand }));
  }

  deleteChainCommand(commandID: string, chainCommandID: string) {
    this.store.dispatch(VStreamActions.deleteChainCommand({ commandID, chainCommandID }));
  }

  createWidget() {
    const id = crypto.randomUUID();

    this.store.dispatch(VStreamActions.createWidget({ id }));
  }

  updateWidget(partialWidget: Partial<VStreamWidget>) {
    this.store.dispatch(VStreamActions.updateWidget({ partialWidget }));
  }

  deleteWidget(id: string) {
    this.store.dispatch(VStreamActions.deleteWidget({ id }));
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
        takeUntilDestroyed(this.destroyRef),
        switchMap(([token, channelInfo, videoID]) => {
          if (!videoID) {
            throw Error('Tried to post a channel message when the video ID was not found.');
          }

          // VStream chat does not like multiple lines.
          const formattedText = text.split('\n').join(' ');

          return this.vstreamApi.postChannelMessage(formattedText, token.accessToken, channelInfo.channelId, videoID);
        }))
      .subscribe({
        error: err => {
          this.logService.add(`Failed to post channel message: ${JSON.stringify(err, undefined, 2)}`, 'error', 'VStreamService.postChannelMessage');
        },
      });
  }
}