import { StaticAuthProvider } from '@twurple/auth';
import { Injectable, OnDestroy } from '@angular/core';
import { TwitchService } from './twitch.service';
import { Subject, switchMap, takeUntil } from 'rxjs';
import {
  TwitchChannelInfo,
  TwitchRedeemInfo,
} from '../state/twitch/twitch.interface';
import { ApiClient } from '@twurple/api';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { ChatClient } from '@twurple/chat';
import { HistoryService } from './history.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TwitchRedeem } from './twitch-pubsub.interface';

@Injectable()
export class TwitchPubSub implements OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  // TTS Helper client ID. This isn't a sensitive code.
  private readonly clientId = 'fprxp4ve0scf8xg6y48nwcq1iogxuq';

  channelInfo?: TwitchChannelInfo;
  listener: EventSubWsListener | null = null;
  chat: ChatClient | null = null;
  selectedRedeem: TwitchRedeemInfo | null = null;

  // Twurple doesn't expose the listener type for some reason.
  onMessageListener?: any;
  redeemListener?: any;

  constructor(
    private readonly twitchService: TwitchService,
    private readonly historyService: HistoryService,
    private readonly snackbar: MatSnackBar
  ) {
    this.twitchService.channelInfo$
      .pipe(
        takeUntil(this.destroyed$),
        switchMap((channelInfo) => {
          this.channelInfo = channelInfo;
          return this.twitchService.twitchToken$;
        })
      )
      .subscribe({
        next: (token) => {
          this.cleanupListeners();

          if (!token || !this.channelInfo?.channelId) {
            return;
          }

          const authProvider = new StaticAuthProvider(this.clientId, token);
          const apiClient = new ApiClient({ authProvider });

          this.listener = new EventSubWsListener({ apiClient });
          this.listener.start();

          this.chat = new ChatClient({
            authProvider,
            channels: [this.channelInfo.username],
          });

          this.chat.connect().catch((e) => {
            console.error(`Failed to connect to chat.`, this.channelInfo, e);

            this.snackbar.open(
              'Oops! We encountered an error connecting to Twitch.',
              'Dismiss',
              {
                panelClass: 'notification-error',
              }
            );
          });

          this.redeemListener = this.listener.onChannelRedemptionAdd(
            this.channelInfo.channelId ?? '',
            (c) => this.onRedeem(c)
          );

          this.onMessageListener = this.chat.onMessage((_, user, text) =>
            this.onMessage(user, text)
          );
        },
        error: (err) => {
          console.error(`Failed to get users Twitch token`, err);
        },
      });

    this.twitchService.selectedRedeem$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((redeem) => (this.selectedRedeem = redeem));
  }

  onMessage(user: string, text: string) {
    /**
     * @TODO - Setup state for global command and prefix.
     */
    if (text.startsWith('!say')) {
      this.historyService.playTts(text.substring(4).trim(), user, 'twitch');
    }
  }

  /**
   * @TODO - Handle redeems by using users selected redeem from twitch settings
   */
  onRedeem(redeem: TwitchRedeem) {
    if (redeem.rewardId === this.selectedRedeem?.id) {
      const trimmedText = redeem.input;
      this.historyService.playTts(
        trimmedText,
        redeem.userDisplayName,
        'twitch'
      );
    }
  }

  cleanupListeners() {
    this.chat?.removeListener(this.onMessageListener);
    this.listener?.removeListener(this.redeemListener);
    this.listener?.stop();
  }

  ngOnDestroy() {
    this.cleanupListeners();
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
