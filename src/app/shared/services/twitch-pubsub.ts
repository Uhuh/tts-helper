import { StaticAuthProvider } from '@twurple/auth';
import { Injectable, OnDestroy } from '@angular/core';
import { TwitchService } from './twitch.service';
import { Subject, takeUntil } from 'rxjs';
import { ApiClient } from '@twurple/api';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { ChatClient } from '@twurple/chat';
import { HistoryService } from './history.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TwitchRedeem } from './twitch-pubsub.interface';
import { TwitchState } from '../state/twitch/twitch.model';

@Injectable()
export class TwitchPubSub implements OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  // TTS Helper client ID. This isn't a sensitive code.
  private readonly clientId = 'fprxp4ve0scf8xg6y48nwcq1iogxuq';

  twitchState?: TwitchState;
  listener: EventSubWsListener | null = null;
  chat: ChatClient | null = null;
  selectedRedeem: string | null = null;

  // Twurple doesn't expose the listener type for some reason.
  onMessageListener?: any;
  redeemListener?: any;

  constructor(
    private readonly twitchService: TwitchService,
    private readonly historyService: HistoryService,
    private readonly snackbar: MatSnackBar
  ) {
    this.twitchService.twitchState$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((twitchState) => {
        this.cleanupListeners();
        this.twitchState = twitchState;

        if (
          !this.twitchState.token ||
          !this.twitchState.channelInfo.channelId
        ) {
          return;
        }

        const authProvider = new StaticAuthProvider(
          this.clientId,
          this.twitchState.token
        );
        const apiClient = new ApiClient({ authProvider });

        this.listener = new EventSubWsListener({ apiClient });
        this.listener.start();

        this.chat = new ChatClient({
          authProvider,
          channels: [this.twitchState.channelInfo.username],
        });

        this.chat.connect().catch((e) => {
          console.error(
            `Failed to connect to chat.`,
            this.twitchState?.channelInfo,
            e
          );

          this.snackbar.open(
            'Oops! We encountered an error connecting to Twitch.',
            'Dismiss',
            {
              panelClass: 'notification-error',
            }
          );
        });

        this.redeemListener = this.listener.onChannelRedemptionAdd(
          this.twitchState.channelInfo.channelId ?? '',
          (c) => this.onRedeem(c)
        );

        this.onMessageListener = this.chat.onMessage((_, user, text) =>
          this.onMessage(user, text)
        );
      });

    this.twitchService.redeem$
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
    if (redeem.rewardId === this.selectedRedeem) {
      const trimmedText = redeem.input.slice(
        0,
        this.twitchState?.redeemCharacterLimit ?? 300
      );

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
