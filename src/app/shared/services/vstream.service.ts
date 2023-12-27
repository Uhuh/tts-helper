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
import {
  VStreamCustomMessageState,
  VStreamFeature,
  VStreamSettingsState,
  VStreamWidget,
} from '../state/vstream/vstream.feature';
import { VStreamChannelID, VStreamVideoID } from './vstream-pubsub.interface';
import { ChatCommand, ChatPermissions, UserPermissions } from './chat.interface';
import { ChatService } from './chat.service';
import { jwtDecode } from 'jwt-decode';
import { TypeID } from 'typeid-js';

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
  readonly commands$ = this.store.select(VStreamFeature.selectChatCommands);
  readonly widgets$ = this.store.select(VStreamFeature.selectWidgets);

  readonly liveStreamID$ = new BehaviorSubject<VStreamVideoID | null>(null);
  readonly isTokenValid$ = interval(1000)
    .pipe(switchMap(() => {
      return this.token$.pipe(map(token => token.expireDate > Date.now() && token.accessToken));
    }));

  cooldowns = new Map<string, {
    duration: number,
    onCooldown: boolean,
    timeout?: NodeJS.Timeout,
  }>();
  autoredeems = new Map<string, {
    interval: number,
    timer: NodeJS.Timer,
  }>();

  constructor(
    private readonly store: Store,
    private readonly vstreamApi: VStreamApi,
    private readonly logService: LogService,
    private readonly chatService: ChatService,
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

    this.commands$
      .pipe(
        tap(commands => {
          const commandIDs = commands.map(c => c.id);
          this.clearOldAutoIntervals(commandIDs);
          this.resetAutoIntervals(commands);
          this.updateCooldowns(commands);
        }),
      ).subscribe();
  }

  /**
   * If a user has updated the cooldowns of an existing command, we want to remove any active cooldowns.
   * @param commands All the VStream chat commands
   * @private
   */
  private updateCooldowns(commands: ChatCommand[]) {
    for (const command of commands) {
      const cooldown = this.cooldowns.get(command.id);

      if (!cooldown) {
        continue;
      }

      const { duration, timeout } = cooldown;
      const newDuration = command.cooldown * 1000;

      if (duration === newDuration) {
        continue;
      }

      clearTimeout(timeout);
      this.cooldowns.delete(command.id);
    }
  }

  private resetAutoIntervals(commands: ChatCommand[]) {
    /**
     * I want to be safe and have the lowest interval be 1 minute.
     */
    const LOWEST_INTERVAL = 60 * 1000;

    for (const command of commands) {
      const interval = command.autoRedeemInterval * LOWEST_INTERVAL;
      const isIntervalValid = interval >= LOWEST_INTERVAL;
      const autoRedeem = this.autoredeems.get(command.id);

      if (command.autoRedeem && !autoRedeem && isIntervalValid) {
        this.autoredeems.set(
          command.id,
          {
            interval,
            timer: setInterval(() => this.handleAutoRedeem(command.id), interval),
          },
        );
      } else if (command.autoRedeem && autoRedeem && autoRedeem.interval !== interval && isIntervalValid) {
        clearInterval(autoRedeem.timer);

        this.autoredeems.set(
          command.id,
          {
            interval,
            timer: setInterval(() => this.handleAutoRedeem(command.id), interval),
          },
        );
      } else if ((!command.autoRedeem || !isIntervalValid) && autoRedeem) {
        clearInterval(autoRedeem.timer);
        this.autoredeems.delete(command.id);
      }
    }
  }

  private clearOldAutoIntervals(commandIDs: string[]) {
    const autoIDs = this.autoredeems.keys();

    /**
     * If a user removes a command that had auto redeem we want to remove it from the timers.
     */
    for (const autoID of autoIDs) {
      const redeemExist = commandIDs.find(id => autoID === id);

      if (redeemExist) {
        continue;
      }

      const redeem = this.autoredeems.get(autoID);
      clearInterval(redeem?.timer);
      this.autoredeems.delete(autoID);
    }
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

  updateCommandSettings(partialCommand: Partial<ChatCommand>, commandID: string) {
    this.store.dispatch(VStreamActions.updateChatCommand({ partialCommand, commandID }));
  }

  updateCommandPermissions(partialPermissions: Partial<ChatPermissions>, commandID: string) {
    this.store.dispatch(VStreamActions.updateChatCommandPermissions({ partialPermissions, commandID }));
  }

  deleteCommand(commandID: string) {
    this.store.dispatch(VStreamActions.deleteChatCommand({ commandID }));
  }

  createChatCommand() {
    this.store.dispatch(VStreamActions.createChatCommand());
  }

  createWidget(widget: Omit<VStreamWidget, 'id'>) {
    const id = crypto.randomUUID();

    this.store.dispatch(VStreamActions.createWidget({
      widget: {
        id,
        ...widget,
      },
    }));
  }

  updateWidget(widget: VStreamWidget) {
    this.store.dispatch(VStreamActions.updateWidget({ widget }));
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

  sendCommandResponse(permissions: UserPermissions, command: ChatCommand | undefined, text: string) {
    if (!command || !command.enabled || this.cooldowns.get(command.id)?.onCooldown) {
      return;
    }

    const hasPerms = this.chatService.hasChatCommandPermissions({ permissions }, command.permissions);

    if (!hasPerms) {
      return;
    }

    let { response } = command;

    const [_, ...args] = text.split(' ');

    for (const i in args) {
      response = response.replaceAll(`{${i}}`, args[i]);
    }

    const duration = command.cooldown * 1000;

    this.postChannelMessage(response);

    this.cooldowns.set(command.id, {
      duration,
      onCooldown: true,
      timeout: setTimeout(() => this.cooldowns.set(command.id, { duration, onCooldown: false }), duration),
    });
  }

  handleAutoRedeem(commandID: string) {
    this.commands$
      .pipe(
        first(),
        map(commands => {
          return commands.find(c => c.id === commandID);
        }),
        tap(command => {
          if (!command) {
            return;
          }

          this.postChannelMessage(command.response);
        }),
      ).subscribe();
  }

  postChannelMessage(text: string) {
    return combineLatest([this.token$, this.channelInfo$, this.liveStreamID$])
      .pipe(
        first(),
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